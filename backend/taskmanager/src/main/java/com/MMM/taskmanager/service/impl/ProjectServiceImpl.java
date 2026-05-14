package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.project.ProjectRequest;
import com.MMM.taskmanager.dto.request.project.UpdateProjectStatusRequest;
import com.MMM.taskmanager.dto.response.project.*;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.*;
import com.MMM.taskmanager.entity.type.ProjectStatus;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.ProjectMapper;
import com.MMM.taskmanager.repository.ProjectMemberRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.TaskRepository;
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
import java.util.Map;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProjectServiceImpl implements ProjectService {

    ProjectRepository projectRepository;
    ProjectMapper projectMapper;
    UserRepository userRepository;
    ProjectMemberRepository projectMemberRepository;
    TaskRepository taskRepository;

    private static final String CACHE_PROJECT_LIST    = "project:list";
    private static final String CACHE_PROJECT_DETAIL  = "project:detail";
    private static final String CACHE_PROJECT_STATS   = "project:stats";
    private static final String CACHE_PROJECT_BOARD   = "project:board";



    @Override
    @Cacheable(value = CACHE_PROJECT_LIST, key = "#root.target.getCurrentUserId() + ':' + #search + ':' + #page + ':' + #size")
    public PageResponse<ProjectSummaryResponse> getProjects(String search, int page, int size) {
        Long userId = getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);

        Page<Project> projectPage = projectRepository
                .findActiveProjectsByUserId(userId, search, pageable);

        List<ProjectSummaryResponse> items = projectPage.getContent().stream()
                .map(project -> {
                    ProjectSummaryResponse response = projectMapper.toSummaryResponse(project);

                    //  Tính stats cho từng project card
                    int totalTasks = taskRepository.countTotalByProject(project.getProjectId());
                    int todoCount = taskRepository.countByProjectAndStatus(project.getProjectId(), "Todo");
                    int inProgressCount = taskRepository.countByProjectAndStatus(project.getProjectId(), "In Progress");

                    int doneCount = taskRepository.countByProjectAndStatus(project.getProjectId(), "Done");
                    double progressRate = totalTasks == 0 ? 0
                            : Math.round((double) doneCount / totalTasks * 100.0);

                    int memberCount = projectMemberRepository.countByProject_ProjectId(project.getProjectId());
                    List<String> memberAvatarUrls = projectMemberRepository
                            .findTop3AvatarUrlsByProjectId(project.getProjectId());

                    return ProjectSummaryResponse.builder()
                            .projectId(response.getProjectId())
                            .projectName(response.getProjectName())
                            .projectDescription(response.getProjectDescription())
                            .status(response.getStatus())
                            .createdBy(response.getCreatedBy())
                            .createdByUsername(response.getCreatedByUsername())
                            .createdAt(response.getCreatedAt())
                            .updatedAt(response.getUpdatedAt())
                            .totalTasks(totalTasks)
                            .todoCount(todoCount)
                            .inProgressCount(inProgressCount)
                            .doneCount(doneCount)
                            .progressRate(progressRate)
                            .memberCount(memberCount)
                            .memberAvatarUrls(memberAvatarUrls)
                            .build();
                })
                .toList();

        return PageResponse.<ProjectSummaryResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(projectPage.getTotalPages())
                .totalElements(projectPage.getTotalElements())
                .hasNext(projectPage.hasNext())
                .hasPrevious(projectPage.hasPrevious())
                .items(items)
                .build();
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
    @Cacheable(value = CACHE_PROJECT_STATS, key = "#root.target.getCurrentUserId()")
    public ProjectOverallStatsResponse getProjectStats() {
        Long userId = getCurrentUserId();

        int totalProjects = (int) projectRepository
                .findActiveProjectsByUserId(userId, null, PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();

        int totalTasks = taskRepository.countByAssignee_UserIdAndDeletedAtIsNull(userId);
        int totalInProgress = taskRepository.countByAssignee_UserIdAndStatusAndDeletedAtIsNull(userId, "In Progress");

        // Tính TB tiến độ
        double avgProgressRate = projectRepository
                .findActiveProjectsByUserId(userId, null, PageRequest.of(0, Integer.MAX_VALUE))
                .getContent().stream()
                .mapToDouble(project -> {
                    int total = taskRepository.countTotalByProject(project.getProjectId());
                    int done = taskRepository.countByProjectAndStatus(project.getProjectId(), "Done");
                    return total == 0 ? 0 : (double) done / total * 100;
                })
                .average()
                .orElse(0);

        return ProjectOverallStatsResponse.builder()
                .totalProjects(totalProjects)
                .totalTasks(totalTasks)
                .totalInProgress(totalInProgress)
                .avgProgressRate(Math.round(avgProgressRate))
                .build();
    }

    @Override
    @Cacheable(value = CACHE_PROJECT_BOARD, key = "#projectId + ':' + #assigneeId + ':' + #labelId")
    public BoardResponse getBoardByProjectId(Long projectId, Long assigneeId, Long labelId) {
        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        List<String> statuses = List.of("Todo", "In Progress", "Review", "Done");
        Map<String, String> displayNames = Map.of(
                "Todo", "Cần Làm",
                "In Progress", "Đang Làm",
                "Review", "Đang Review",
                "Done", "Hoàn Thành"
        );

        List<BoardColumnResponse> columns = statuses.stream()
                .map(status -> {
                    List<BoardTaskResponse> tasks = taskRepository
                            .findBoardTasks(projectId, status, assigneeId, labelId)
                            .stream()
                            .map(task -> BoardTaskResponse.builder()
                                    .taskId(task.getTaskId())
                                    .taskName(task.getTaskName())
                                    .priority(task.getPriority())
                                    .dueDate(task.getDueAt())
                                    .assigneeId(task.getAssignee() != null ? task.getAssignee().getUserId() : null)
                                    .assigneeUsername(task.getAssignee() != null ? task.getAssignee().getUserName() : null)
                                    .assigneeAvatarUrl(task.getAssignee() != null ? task.getAssignee().getAvatarUrl() : null)
                                    .labels(task.getLabels() != null ? task.getLabels().stream().map(Label::getLabelName).toList() : List.of())
                                    .build())
                            .toList();

                    return BoardColumnResponse.builder()
                            .status(status)
                            .displayName(displayNames.get(status))
                            .taskCount(tasks.size())
                            .tasks(tasks)
                            .build();
                })
                .toList();

        return BoardResponse.builder()
                .projectId(project.getProjectId())
                .projectName(project.getProjectName())
                .columns(columns)
                .build();
    }

    @Override
    @Cacheable(value = CACHE_PROJECT_LIST, key = "'admin:' + #search + ':' + #includeDeleted + ':' + #page + ':' + #size")
    public PageResponse<ProjectSummaryResponse> getAllProjectsForAdmin(String search, boolean includeDeleted, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<Project> projectPage = !includeDeleted ? projectRepository.findAllActiveProjectsForAdmin(search, pageable) : projectRepository.findAllProjectsForAdmin(search, pageable);

        List<ProjectSummaryResponse> items = projectPage.getContent().stream()
                .map(project -> {
                    ProjectSummaryResponse response = projectMapper.toSummaryResponse(project);

                    int totalTasks = taskRepository.countTotalByProject(project.getProjectId());
                    int doneCount = taskRepository.countByProjectAndStatus(project.getProjectId(), "Done");
                    double progressRate = totalTasks == 0 ? 0 : Math.round((double) doneCount / totalTasks * 100.0);
                    int memberCount = projectMemberRepository.countByProject_ProjectId(project.getProjectId());
                    List<String> memberAvatarUrls = projectMemberRepository.findTop3AvatarUrlsByProjectId(project.getProjectId());

                    return ProjectSummaryResponse.builder()
                            .projectId(response.getProjectId())
                            .projectName(response.getProjectName())
                            .projectDescription(response.getProjectDescription())
                            .status(project.getStatus())
                            .createdBy(response.getCreatedBy())
                            .createdByUsername(response.getCreatedByUsername())
                            .createdAt(response.getCreatedAt())
                            .updatedAt(response.getUpdatedAt())
                            .totalTasks(totalTasks)
                            .doneCount(doneCount)
                            .progressRate(progressRate)
                            .memberCount(memberCount)
                            .memberAvatarUrls(memberAvatarUrls)
                            .build();
                }).toList();
        return PageResponse.<ProjectSummaryResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(projectPage.getTotalPages())
                .totalElements(projectPage.getTotalElements())
                .hasNext(projectPage.hasNext())
                .hasPrevious(projectPage.hasPrevious())
                .items(items)
                .build();

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

        ProjectMember member = ProjectMember.builder()
                .project(saved)
                .user(user)
                .joinedAt(LocalDateTime.now())
                .role("Admin")
                .build();
        projectMemberRepository.save(member);

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

        Project project = getProjectAndCheckPermission(projectId, userId);

        project.setProjectName(request.getProjectName());
        project.setProjectDescription(request.getProjectDescription() == null ? project.getProjectDescription() : request.getProjectDescription());
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
        Project project = getProjectAndCheckPermission(projectId, userId);

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
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NEVER_BE_DELETED));

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

        Project project = getProjectAndCheckPermission(projectId, userId);

        project.setDeletedAt(LocalDateTime.now());
        project.setUpdatedBy(userRepository.getReferenceById(userId));

        log.info("Soft deleted project id={} by userId={}", projectId, userId);
    }

    public Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }


    private Project getProjectAndCheckPermission(Long projectId, Long userId) {
        Project project = projectRepository.findByProjectIdAndDeletedAtIsNull(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));


        boolean isSystemAdmin = SecurityUtils.isAdmin();
        boolean isProjectAdmin = projectMemberRepository
                .existsByProject_ProjectIdAndUser_UserIdAndRole(projectId, userId, "Admin");

        if (!isSystemAdmin && !isProjectAdmin) {
            throw new AppException(ErrorCode.PROJECT_ACCESS_DENIED);
        }

        return project;
    }
}
