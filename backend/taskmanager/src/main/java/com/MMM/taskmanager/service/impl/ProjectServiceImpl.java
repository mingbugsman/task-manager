package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.project.ProjectRequest;
import com.MMM.taskmanager.dto.request.project.UpdateProjectStatusRequest;
import com.MMM.taskmanager.dto.response.project.BroadResponse;
import com.MMM.taskmanager.dto.response.project.ProjectDetailResponse;
import com.MMM.taskmanager.dto.response.project.ProjectOverallStatsResponse;
import com.MMM.taskmanager.dto.response.project.ProjectSummaryResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.ProjectStatus;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.ProjectMapper;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.ProjectService;
import com.MMM.taskmanager.util.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectServiceImpl implements ProjectService {

    ProjectRepository projectRepository;
    ProjectMapper projectMapper;
    UserRepository userRepository;

    private static final String CACHE_PROJECT_LIST    = "project:list";
    private static final String CACHE_PROJECT_DETAIL  = "project:detail";
    private static final String CACHE_PROJECT_STATS   = "project:stats";
    private static final String CACHE_PROJECT_BOARD   = "project:board";

    @Override
    public PageResponse<ProjectSummaryResponse> getProjects(String search, int page, int size) {
        return null;
    }

    @Override
    @Cacheable(value = CACHE_PROJECT_DETAIL, key = "#projectId")
    public ProjectDetailResponse getProjectDetail(Long projectId) {
        Long userId = getCurrentUserId();

        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));


        boolean isMember = projectRepository.existsByProjectIdAndUserId(projectId, userId);

        if (!(SecurityUtils.isAdmin() || isMember)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return projectMapper.toDetailResponse(project);

    }

    @Override
    public ProjectOverallStatsResponse getProjectStats() {
        return null;
    }

    @Override
    public BroadResponse getBoardByProjectId(Long projectId, Long assigneeId, Long labelId) {
        return null;
    }

    @Override
    @Transactional
    @CacheEvict(value = {CACHE_PROJECT_LIST, CACHE_PROJECT_STATS},
            key = "#root.target.getCurrentUserId()")
    public ProjectDetailResponse createProject(ProjectRequest request) {
        Long userId = getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Project project = projectMapper.toEntity(request);
        project.setCreatedBy(user);
        project.setUpdatedBy(user);
        project.setStatus(ProjectStatus.ACTIVE);

        Project saved = projectRepository.save(project);

        // auto add user creating project with role admin

        log.info("Created project id={} by userId={}", saved.getProjectId(), userId);
        return projectMapper.toDetailResponse(saved);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CACHE_PROJECT_DETAIL, key = "#projectId"),
            @CacheEvict(value = CACHE_PROJECT_LIST, key = "#root.target.getCurrentUserId()"),
            @CacheEvict(value = CACHE_PROJECT_STATS, key = "#root.target.getCurrentUserId()")
    })
    public ProjectDetailResponse updateProject(Long projectId, ProjectRequest request) {
        Long userId = getCurrentUserId();

        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId).orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        project.setProjectName(request.getProjectName());
        project.setProjectDescription(request.getProjectDescription());
        project.setUpdatedBy(userRepository.getReferenceById(userId));

        log.info("Updated project id={} by userId={}", projectId, userId);
        return projectMapper.toDetailResponse(project);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CACHE_PROJECT_DETAIL, key = "#projectId"),
            @CacheEvict(value = CACHE_PROJECT_LIST, key = "#root.target.getCurrentUserId()"),
            @CacheEvict(value = CACHE_PROJECT_STATS, key = "#root.target.getCurrentUserId()")
    })
    public ProjectDetailResponse updateProjectStatus(Long projectId, UpdateProjectStatusRequest request) {
        Long userId = getCurrentUserId();
        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        project.setStatus(request.getStatus());
        project.setUpdatedBy(userRepository.getReferenceById(userId));

        log.info("Updated project status id={} status={} by userId={}", projectId, request.getStatus(), userId);
        return projectMapper.toDetailResponse(project);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CACHE_PROJECT_DETAIL, key = "#projectId"),
            @CacheEvict(value = CACHE_PROJECT_LIST, key = "#root.target.getCurrentUserId()"),
            @CacheEvict(value = CACHE_PROJECT_STATS, key = "#root.target.getCurrentUserId()")
    })
    public ProjectDetailResponse restoreProject(Long projectId) {
        Long userId = getCurrentUserId();


        Project project = projectRepository.findByProjectIdAndDeletedAtIsNotNull(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        if (!SecurityUtils.isAdmin() &&
                !project.getCreatedBy().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.PROJECT_ACCESS_DENIED);
        }

        project.setDeletedAt(null);
        project.setStatus(ProjectStatus.ACTIVE);
        project.setUpdatedBy(userRepository.getReferenceById(userId));

        log.info("Restored project id={} by userId={}", projectId, userId);
        return projectMapper.toDetailResponse(project);
    }

    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CACHE_PROJECT_DETAIL, key = "#projectId"),
            @CacheEvict(value = CACHE_PROJECT_LIST, key = "#root.target.getCurrentUserId()"),
            @CacheEvict(value = CACHE_PROJECT_STATS, key = "#root.target.getCurrentUserId()"),
            @CacheEvict(value = CACHE_PROJECT_BOARD, key = "#projectId")
    })

    public void deleteProject(Long projectId) {
        Long userId = getCurrentUserId();

        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId).orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        project.setDeletedAt(LocalDateTime.now());
        project.setUpdatedBy(userRepository.getReferenceById(userId));

        log.info("Soft deleted project id={} by userId={}", projectId, userId);
    }

    public Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }


//    private Project getProjectAndCheckPermission(Long projectId, Long userId) {
//        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId)
//                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
//
//
//        boolean isSystemAdmin = SecurityUtils.isAdmin();
//        boolean isProjectAdmin = projectMemberRepository
//                .existsByProject_ProjectIdAndUser_UserIdAndRole(projectId, userId, "ADMIN");
//
//        if (!isSystemAdmin && !isProjectAdmin) {
//            throw new AppException(ErrorCode.PROJECT_ACCESS_DENIED);
//        }
//
//        return project;
//    }
}
