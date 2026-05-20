package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.project_invite.CreateInviteLinkRequest;
import com.MMM.taskmanager.dto.response.project_invite.InviteLinkResponse;
import com.MMM.taskmanager.dto.response.project_invite.InvitePreviewResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.ProjectInviteLink;
import com.MMM.taskmanager.entity.ProjectMember;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.ProjectRole;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.ProjectMemberMapper;
import com.MMM.taskmanager.repository.ProjectInviteLinkRepository;
import com.MMM.taskmanager.repository.ProjectMemberRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import com.MMM.taskmanager.service.ActivityLogRecorder;
import com.MMM.taskmanager.service.ProjectInviteLinkService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProjectInviteLinkServiceImpl implements ProjectInviteLinkService {

    private static final String CACHE_MEMBERS = "members:project:v2";
    private static final String CACHE_MEMBER_STAT = "members:statistic:v2";

    final ProjectInviteLinkRepository inviteLinkRepository;
    final ProjectMemberRepository projectMemberRepository;
    final ProjectRepository projectRepository;
    final UserRepository userRepository;
    final ProjectMemberMapper projectMemberMapper;
    final ActivityLogRecorder activityLogRecorder;

    @Value("${app.frontend-url:http://localhost:3000}")
    String frontendUrl;

    @Override
    @Transactional
    public InviteLinkResponse createInviteLink(
            Long projectId, Long inviterId, CreateInviteLinkRequest request
    ) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        ProjectMember inviter = projectMemberRepository
                .findByProjectIdAndUserId(projectId, inviterId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_ACCESS_DENIED));

        ProjectRole inviterRole = ProjectRole.from(inviter.getRole());
        ProjectRole targetRole = ProjectRole.from(request.getRole());

        if (!inviterRole.canInvite(targetRole)) {
            throw new AppException(ErrorCode.PROJECT_MEMBER_INVALID_INVITE);
        }

        User creator = userRepository.findById(inviterId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        LocalDateTime expiresAt = null;
        if (request.getExpiresInDays() != null && request.getExpiresInDays() > 0) {
            expiresAt = LocalDateTime.now().plusDays(request.getExpiresInDays());
        }

        String token = UUID.randomUUID().toString().replace("-", "");

        ProjectInviteLink link = ProjectInviteLink.builder()
                .project(project)
                .token(token)
                .role(targetRole.getDisplayName())
                .createdBy(creator)
                .expiresAt(expiresAt)
                .build();

        ProjectInviteLink saved = inviteLinkRepository.save(link);
        String invitePath = "/invite/" + token;

        return InviteLinkResponse.builder()
                .token(saved.getToken())
                .role(saved.getRole())
                .projectId(project.getProjectId())
                .projectName(project.getProjectName())
                .expiresAt(saved.getExpiresAt())
                .createdAt(saved.getCreatedAt())
                .inviteUrl(frontendUrl.replaceAll("/$", "") + invitePath)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public InvitePreviewResponse getInvitePreview(String token) {
        return inviteLinkRepository.findByTokenWithDetails(token)
                .map(this::toPreview)
                .orElse(InvitePreviewResponse.builder()
                        .valid(false)
                        .message("Liên kết mời không tồn tại hoặc đã bị thu hồi.")
                        .build());
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CACHE_MEMBERS, allEntries = true),
            @CacheEvict(value = CACHE_MEMBER_STAT, allEntries = true)
    })
    public ProjectMemberResponse acceptInvite(String token, Long userId) {
        ProjectInviteLink link = inviteLinkRepository.findByTokenWithDetails(token)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_INVITE_LINK_NOT_FOUND));

        if (!link.isActive()) {
            throw new AppException(ErrorCode.PROJECT_INVITE_LINK_EXPIRED);
        }

        Long projectId = link.getProject().getProjectId();

        if (projectMemberRepository.existsByProject_ProjectIdAndUser_UserId(projectId, userId)) {
            throw new AppException(ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        ProjectMember member = ProjectMember.builder()
                .project(link.getProject())
                .user(user)
                .role(link.getRole())
                .build();

        ProjectMember saved = projectMemberRepository.save(member);
        activityLogRecorder.record(
                "JOIN",
                ActivityLogEntityType.PROJECT,
                projectId,
                projectId,
                ActivityLogRecorder.metadataJson(
                        "projectId", String.valueOf(projectId),
                        "userId", String.valueOf(userId),
                        "role", link.getRole(),
                        "via", "invite_link"
                )
        );
        return projectMemberMapper.toResponseDTO(saved);
    }

    private InvitePreviewResponse toPreview(ProjectInviteLink link) {
        if (link.isRevoked()) {
            return InvitePreviewResponse.builder()
                    .valid(false)
                    .message("Liên kết mời đã bị thu hồi.")
                    .build();
        }
        if (link.isExpired()) {
            return InvitePreviewResponse.builder()
                    .valid(false)
                    .message("Liên kết mời đã hết hạn.")
                    .build();
        }

        String inviterName = link.getCreatedBy().getUserName();
        if (inviterName == null || inviterName.isBlank()) {
            inviterName = link.getCreatedBy().getEmail();
        }

        return InvitePreviewResponse.builder()
                .valid(true)
                .message("Bạn được mời tham gia dự án.")
                .projectId(link.getProject().getProjectId())
                .projectName(link.getProject().getProjectName())
                .role(link.getRole())
                .inviterName(inviterName)
                .build();
    }
}
