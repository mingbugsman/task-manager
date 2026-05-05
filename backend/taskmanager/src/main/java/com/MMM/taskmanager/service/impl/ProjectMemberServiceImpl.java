package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.project_member.InviteMemberRequest;
import com.MMM.taskmanager.dto.request.project_member.UpdateMemberRoleRequest;
import com.MMM.taskmanager.dto.response.project_member.MemberStatisticResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.ProjectMember;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.ProjectRole;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.ProjectMemberMapper;
import com.MMM.taskmanager.repository.ProjectMemberRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.ProjectMemberService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectMemberServiceImpl implements ProjectMemberService {
    private static final Logger log = LoggerFactory.getLogger(ProjectMemberServiceImpl.class);
    ProjectMemberRepository projectMemberRepository;
      ProjectRepository projectRepository;
      UserRepository userRepository;
      ProjectMemberMapper projectMemberMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            value = "members:project",
            key   = "#projectId + ':' + #role + ':' + #page + ':' + #size"
    )
    public PageResponse<ProjectMemberResponse> getMembers(Long projectId, String role, int page, int size) {

        log.info("Lấy danh sách member [projectId={}, role={}, page={}, size={}]",
                projectId, role, page, size);

        validateProjectExists(projectId);

        // Validate role nếu có truyền vào
        if (role != null) {
            ProjectRole.from(role);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<ProjectMember> memberPage =
                projectMemberRepository.findMembersByProjectId(projectId, role, pageable);




        List<ProjectMemberResponse> items = memberPage.getContent()
                .stream()
                .map(projectMemberMapper::toResponseDTO)
                .toList();

        return buildPageResponse(items, memberPage, page, size);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "members:statistic", key = "#projectId")
    public MemberStatisticResponse getMemberStatistic(Long projectId) {
        log.debug("Lấy thống kê member [projectId={}]", projectId);

        validateProjectExists(projectId);

        List<Object[]> grouped = projectMemberRepository.countMembersByRoleGrouped(projectId);
        Map<String, Long> countMap = new HashMap<>();
        for (Object[] row : grouped) {
            countMap.put((String) row[0], (Long) row[1]);
        }

        long totalMembers = countMap.values().stream().mapToLong(Long::longValue).sum();

        return MemberStatisticResponse.builder()
                .totalMembers(totalMembers)
                .adminCount(countMap.getOrDefault("Admin",  0L))
                .leadCount(countMap.getOrDefault("Lead",    0L))
                .memberCount(countMap.getOrDefault("Member", 0L))
                .viewerCount(countMap.getOrDefault("Reviewer", 0L))
                .build();
    }


    // 2. INVITE

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "members:project",   allEntries = true),
            @CacheEvict(value = "members:statistic", key = "#projectId")
    })
    public ProjectMemberResponse inviteMember(
            Long projectId, Long inviterId, InviteMemberRequest request
    ) {
        log.debug("Mời member [projectId={}, inviterId={}, targetUserId={}]",
                projectId, inviterId, request.getUserId());

        validateProjectExists(projectId);

        // Lấy role của người mời
        ProjectMember inviter = getMemberOrThrow(projectId, inviterId);
        ProjectRole inviterRole = ProjectRole.from(inviter.getRole());

        // Validate role target hợp lệ
        ProjectRole targetRole = ProjectRole.from(request.getRole());

        // Kiểm tra quyền mời
        System.out.println("quyen han nguoi dung nay la:" + inviterRole.getDisplayName());
        if (!inviterRole.canInvite(targetRole)) {
            throw new AppException(ErrorCode.PROJECT_MEMBER_INVALID_INVITE);
        }

        // Kiểm tra user đã là member chưa
        if (projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(
                projectId, request.getUserId())) {
            throw new AppException(ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS);
        }

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        User targetUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ProjectMember newMember = ProjectMember.builder()
                .project(project)
                .user(targetUser)
                .role(targetRole.getDisplayName())
                .build();

        ProjectMember saved = projectMemberRepository.save(newMember);
        log.info("Mời member thành công [projectId={}, userId={}, role={}]",
                projectId, request.getUserId(), targetRole.getDisplayName());

        return projectMemberMapper.toResponseDTO(saved);
    }


    // 3. UPDATE ROLE

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "members:project",   allEntries = true),
            @CacheEvict(value = "members:statistic", key = "#projectId")
    })
    public ProjectMemberResponse updateRole(
            Long projectId, Long adminId, Long targetUserId, UpdateMemberRoleRequest request
    ) {
        log.debug("Đổi role [projectId={}, adminId={}, targetUserId={}]",
                projectId, adminId, targetUserId);

        // Kiểm tra người thực hiện có phải ADMIN không
        ProjectMember admin = getMemberOrThrow(projectId, adminId);
        if (!ProjectRole.from(admin.getRole()).canChangeRole()) {
            throw new AppException(ErrorCode.PROJECT_ACCESS_DENIED);
        }

        // Validate role mới hợp lệ
        ProjectRole newRole = ProjectRole.from(request.getRole());

        // Không cho phép ADMIN tự hạ role của chính mình
        // (tránh project không còn ADMIN)
        if (adminId.equals(targetUserId) && newRole != ProjectRole.ADMIN) {
            throw new AppException(ErrorCode.PROJECT_ACCESS_DENIED);
        }

        ProjectMember target = getMemberOrThrow(projectId, targetUserId);
        target.setRole(newRole.getDisplayName());

        ProjectMember updated = projectMemberRepository.save(target);
        log.info("Đổi role thành công [projectId={}, userId={}, newRole={}]",
                projectId, targetUserId, newRole.getDisplayName());

        return projectMemberMapper.toResponseDTO(updated);
    }


    // 4. KICK


    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "members:project",   allEntries = true),
            @CacheEvict(value = "members:statistic", key = "#projectId")
    })

    public void kickMember(Long projectId, Long kickerId, Long targetUserId) {
        log.debug("Kick member [projectId={}, kickerId={}, targetUserId={}]",
                projectId, kickerId, targetUserId);

        // Không cho phép tự kick chính mình
        if (kickerId.equals(targetUserId)) {
            throw new AppException(ErrorCode.MEMBER_CANNOT_KICK_THEMSELF);
        }

        ProjectMember kicker = getMemberOrThrow(projectId, kickerId);
        ProjectMember target = getMemberOrThrow(projectId, targetUserId);

        ProjectRole kickerRole = ProjectRole.from(kicker.getRole());
        ProjectRole targetRole = ProjectRole.from(target.getRole());

        if (!kickerRole.canKick(targetRole)) {
            throw new AppException(ErrorCode.MEMBER_CANNOT_KICK_ADMIN);
        }

        projectMemberRepository.deleteByProject_ProjectIdAndUser_UserId(projectId, targetUserId);
        log.info("Kick member thành công [projectId={}, userId={}]", projectId, targetUserId);
    }


    // 5. LEAVE


    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "members:project",   allEntries = true),
            @CacheEvict(value = "members:statistic", key = "#projectId")
    })
    public void leaveProject(Long projectId, Long userId) {
        log.info("Leave project [projectId={}, userId={}]", projectId, userId);

        ProjectMember member = getMemberOrThrow(projectId, userId);

        // ADMIN không được rời nếu là ADMIN duy nhất
        if (ProjectRole.from(member.getRole()) == ProjectRole.ADMIN) {
            long adminCount = projectMemberRepository
                    .countByProject_ProjectIdAndRole(projectId, "Admin");
            if (adminCount <= 1) {
                throw new AppException(ErrorCode.PROJECT_OWNER_CANNOT_LEAVE);
            }
        }

        projectMemberRepository.deleteByProject_ProjectIdAndUser_UserId(projectId, userId);
        log.info("Leave project thành công [projectId={}, userId={}]", projectId, userId);
    }




    private void validateProjectExists(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new AppException(ErrorCode.PROJECT_NOT_FOUND);
        }
    }

    private ProjectMember getMemberOrThrow(Long projectId, Long userId) {
        return projectMemberRepository.findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_MEMBER_NOT_FOUND));
    }

    private <T> PageResponse<T> buildPageResponse(List<T> items, Page<?> page, int currentPage, int size) {
        return PageResponse.<T>builder()
                .currentPage(currentPage)
                .pageSize(size)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .items(items)
                .build();
    }
}
