package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.task.TaskCreateRequest;
import com.MMM.taskmanager.dto.request.task.TaskUpdateRequest;
import com.MMM.taskmanager.dto.response.task.TaskDetailResponse;
import com.MMM.taskmanager.dto.response.task.TaskStatisticResponse;
import com.MMM.taskmanager.dto.response.task.TaskSummaryResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.*;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.TaskMapper;
import com.MMM.taskmanager.repository.*;
import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import com.MMM.taskmanager.entity.type.ProjectRole;
import com.MMM.taskmanager.service.ActivityLogRecorder;
import com.MMM.taskmanager.service.TaskService;
import com.MMM.taskmanager.util.SecurityUtils;
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
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TaskServiceImpl implements TaskService {

    TaskRepository taskRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;
    LabelRepository labelRepository;
    TaskMapper taskMapper;
    ProjectMemberRepository projectMemberRepository;
    ActivityLogRecorder activityLogRecorder;

    // =========================================================
    // GET /tasks?projectId=...
    // Chỉ member trong dự án hoặc ADMIN mới xem được
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tasks", key = "'project:' + #projectId + ':status:' + #status + ':search:' + #search + ':page:' + #page + ':size:' + #size")
    public PageResponse<TaskSummaryResponse> getTasksByProject(Long projectId, String status, String search, int page, int size) {
        Long userId = SecurityUtils.getCurrentUserId();
        checkProjectMemberOrAdmin(projectId, userId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Task> taskPage = taskRepository.findByProjectIdAndFilters(projectId, status, search, pageable);
        List<TaskSummaryResponse> items = taskMapper.toSummaryResponseList(taskPage.getContent());

        return PageResponse.<TaskSummaryResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(taskPage.getTotalPages())
                .totalElements(taskPage.getTotalElements())
                .hasNext(taskPage.hasNext())
                .hasPrevious(taskPage.hasPrevious())
                .items(items)
                .build();
    }

    // =========================================================
    // GET /tasks/{taskId}
    // Chỉ member trong dự án hoặc ADMIN mới xem được
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "task", key = "#taskId")
    public TaskDetailResponse getTaskDetail(Long taskId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        checkProjectMemberOrAdmin(task.getProject().getProjectId(), userId);

        return taskMapper.toDetailResponse(task);
    }

    // =========================================================
    // GET /tasks/my-tasks
    // =========================================================
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "myTasks", key = "#userId")
    public List<TaskSummaryResponse> getMyTasks(Long userId) {
        List<Task> tasks = taskRepository.findMyTasks(userId);
        return taskMapper.toSummaryResponseList(tasks);
    }

    // =========================================================
    // GET /tasks/statistic?projectId=...
    // =========================================================
    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "taskStatistic", key = "#projectId")
    public TaskStatisticResponse getStatisticByProject(Long projectId) {
        LocalDateTime now = LocalDateTime.now();
        long total = taskRepository.countTotalByProject(projectId);
        long todo = taskRepository.countByProjectAndStatus(projectId, "Todo");
        long inProgress = taskRepository.countByProjectAndStatus(projectId, "In Progress");
        long done = taskRepository.countByProjectAndStatus(projectId, "Done");
        long overdue = taskRepository.countOverdueByProject(projectId, now);

        return TaskStatisticResponse.builder()
                .projectId(projectId)
                .totalTasks(total)
                .todoCount(todo)
                .inProgressCount(inProgress)
                .doneCount(done)
                .overdueCount(overdue)
                .build();
    }

    // =========================================================
    // POST /tasks
    // Assignee phải là member trong dự án
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "project:board", allEntries = true),
            @CacheEvict(value = "taskStatistic", key = "#projectId"),
            @CacheEvict(value = "project:list", allEntries = true),
            @CacheEvict(value = "myTasks", allEntries = true)
    })
    public TaskDetailResponse createTask(Long projectId, TaskCreateRequest request, Long reporterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            // Kiểm tra assignee phải là member của project
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            boolean isAssigneeMember = projectMemberRepository
                    .existsByProject_ProjectIdAndUser_UserId(projectId, request.getAssigneeId());
            if (!isAssigneeMember) {
                throw new AppException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
            }
        }

        Set<Label> labels = new HashSet<>();
        if (request.getLabelIds() != null && !request.getLabelIds().isEmpty()) {
            labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
        }

        Task task = Task.builder()
                .project(project)
                .taskName(request.getTaskName())
                .taskDescription(request.getTaskDescription())
                .priority(request.getPriority() != null ? request.getPriority() : 2)
                .status("Todo")
                .assignee(assignee)
                .reporter(reporter)
                .dueAt(request.getDueAt())
                .labels(labels)
                .build();

        Task saved = taskRepository.save(task);
        log.info("Created task id={} in projectId={} by reporterId={}", saved.getTaskId(), projectId, reporterId);
        activityLogRecorder.record(
                "CREATE",
                ActivityLogEntityType.TASK,
                saved.getTaskId(),
                projectId,
                ActivityLogRecorder.metadataJson(
                        "taskId", String.valueOf(saved.getTaskId()),
                        "taskName", saved.getTaskName(),
                        "projectId", String.valueOf(projectId)
                )
        );
        return taskMapper.toDetailResponse(saved);
    }

    // =========================================================
    // PUT /tasks/{taskId}
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "project:board", allEntries = true),
            @CacheEvict(value = "taskStatistic", key = "#result.projectId"),
            @CacheEvict(value = "project:list", allEntries = true),
            @CacheEvict(value = "myTasks", allEntries = true)
    })
    public TaskDetailResponse updateTask(Long taskId, TaskUpdateRequest request, Long updatedByUserId) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        checkCanModifyTask(task, updatedByUserId);

        User updatedBy = userRepository.findById(updatedByUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (request.getAssigneeId() != null) {
            assertCanChangeAssignee(task, updatedByUserId, request.getAssigneeId());
            //  Kiểm tra assignee phải là member của project
            boolean isAssigneeMember = projectMemberRepository
                    .existsByProject_ProjectIdAndUser_UserId(
                            task.getProject().getProjectId(), request.getAssigneeId());
            if (!isAssigneeMember) {
                throw new AppException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
            }

            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
            task.setAssignee(assignee);
        }

        if (request.getLabelIds() != null) {
            Set<Label> labels = new HashSet<>(labelRepository.findAllById(request.getLabelIds()));
            task.setLabels(labels);
        }

        task.setTaskName(request.getTaskName());
        task.setTaskDescription(request.getTaskDescription());
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus());
        task.setDueAt(request.getDueAt());
        task.setUpdatedBy(updatedBy);

        Task saved = taskRepository.save(task);
        log.info("Updated task id={} by userId={}", taskId, updatedByUserId);
        activityLogRecorder.record(
                "UPDATE",
                ActivityLogEntityType.TASK,
                saved.getTaskId(),
                saved.getProject().getProjectId(),
                ActivityLogRecorder.metadataJson(
                        "taskId", String.valueOf(saved.getTaskId()),
                        "taskName", saved.getTaskName(),
                        "status", saved.getStatus()
                )
        );
        return taskMapper.toDetailResponse(saved);
    }

    // =========================================================
    // PATCH /tasks/{taskId}/assign
    //  Assignee phải là member trong dự án
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskDetailResponse assignTask(Long taskId, Long assigneeUserId) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        // Kiểm tra assignee phải là member của project
        boolean isAssigneeMember = projectMemberRepository
                .existsByProject_ProjectIdAndUser_UserId(
                        task.getProject().getProjectId(), assigneeUserId);
        if (!isAssigneeMember) {
            throw new AppException(ErrorCode.PROJECT_MEMBER_NOT_FOUND);
        }

        User assignee = userRepository.findById(assigneeUserId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        task.setAssignee(assignee);
        log.info("Assigned task id={} to userId={}", taskId, assigneeUserId);
        return taskMapper.toDetailResponse(taskRepository.save(task));
    }

    // =========================================================
    // PATCH /tasks/{taskId}/due-at
    // ✅ Chỉ Admin hệ thống, Admin project hoặc Lead mới được
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskDetailResponse updateDueAt(Long taskId, LocalDateTime dueAt) {
        Long userId = SecurityUtils.getCurrentUserId();

        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        checkCanModifyTask(task, userId);

        task.setDueAt(dueAt);
        log.info("Updated dueAt task id={} by userId={}", taskId, userId);
        return taskMapper.toDetailResponse(taskRepository.save(task));
    }

    // =========================================================
    // PATCH /tasks/{taskId}/status
    // Chỉ Admin hệ thống, Admin project hoặc Lead mới được
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "project:board", allEntries = true),
            @CacheEvict(value = "taskStatistic", allEntries = true),
            @CacheEvict(value = "project:list", allEntries = true)
    })
    public TaskDetailResponse updateStatus(Long taskId, String status) {
        Long userId = SecurityUtils.getCurrentUserId();

        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        checkCanModifyTask(task, userId);

        task.setStatus(status);
        log.info("Updated status task id={} to status={} by userId={}", taskId, status, userId);
        Task saved = taskRepository.save(task);
        activityLogRecorder.record(
                "MOVE",
                ActivityLogEntityType.TASK,
                saved.getTaskId(),
                saved.getProject().getProjectId(),
                ActivityLogRecorder.metadataJson(
                        "taskId", String.valueOf(saved.getTaskId()),
                        "taskName", saved.getTaskName(),
                        "newStatus", status
                )
        );
        return taskMapper.toDetailResponse(saved);
    }

    // =========================================================
    // DELETE /tasks/{taskId}
    // Chỉ Lead, Admin project hoặc ADMIN hệ thống mới xóa được
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "project:board", allEntries = true),
            @CacheEvict(value = "taskStatistic", allEntries = true),
            @CacheEvict(value = "project:list", allEntries = true),
            @CacheEvict(value = "myTasks", allEntries = true)
    })
    public void deleteTask(Long taskId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        //  Chỉ Lead, Admin project hoặc ADMIN hệ thống mới xóa được
        checkProjectManagerOrAdmin(task.getProject().getProjectId(), userId);

        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
        log.info("Soft deleted task id={} by userId={}", taskId, userId);
        activityLogRecorder.record(
                "DELETE",
                ActivityLogEntityType.TASK,
                taskId,
                task.getProject().getProjectId(),
                ActivityLogRecorder.metadataJson(
                        "taskId", String.valueOf(taskId),
                        "taskName", task.getTaskName()
                )
        );
    }

    // =========================================================
    // DELETE /tasks/project/{projectId}
    //  Chỉ Admin project hoặc ADMIN hệ thống mới xóa được
    // =========================================================
    @Override
    @Caching(evict = {
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "task", allEntries = true),
            @CacheEvict(value = "myTasks", allEntries = true)
    })
    public void deleteTasksByProject(Long projectId) {
        Long userId = SecurityUtils.getCurrentUserId();

        if (!projectRepository.existsById(projectId)) {
            throw new AppException(ErrorCode.PROJECT_NOT_FOUND);
        }

        //  Chỉ Admin project hoặc ADMIN hệ thống mới xóa được toàn bộ task
        checkProjectManagerOrAdmin(projectId, userId);

        taskRepository.softDeleteByProjectId(projectId, LocalDateTime.now());
        log.info("Soft deleted all tasks in projectId={} by userId={}", projectId, userId);
    }

    // =========================================================
    // Helper — Kiểm tra user là member hoặc ADMIN hệ thống
    // =========================================================
    private void checkProjectMemberOrAdmin(Long projectId, Long userId) {
        if (SecurityUtils.isAdmin()) return;

        boolean isMember = projectMemberRepository
                .existsByProject_ProjectIdAndUser_UserId(projectId, userId);
        if (!isMember) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    // =========================================================
    // Helper — Kiểm tra user là Admin/Lead project hoặc ADMIN hệ thống
    // =========================================================
    private void checkProjectManagerOrAdmin(Long projectId, Long userId) {
        if (SecurityUtils.isAdmin()) return;

        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.FORBIDDEN));

        // Dùng isManager() có sẵn trong entity — Admin hoặc Lead
        if (!member.isManager()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    /**
     * OWNER/LEAD: sửa mọi task. MEMBER: chỉ task được giao cho mình. VIEWER: không sửa.
     */
    private void checkCanModifyTask(Task task, Long userId) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        Long projectId = task.getProject().getProjectId();
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_ACCESS_DENIED));

        ProjectRole role = ProjectRole.from(member.getRole());
        if (role == ProjectRole.OWNER || role == ProjectRole.LEAD) {
            return;
        }
        if (role == ProjectRole.VIEWER) {
            throw new AppException(ErrorCode.TASK_ACCESS_DENIED);
        }

        User assignee = task.getAssignee();
        if (assignee == null || !assignee.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.TASK_ACCESS_DENIED);
        }
    }

    /** Chỉ OWNER/LEAD (hoặc admin hệ thống) được đổi người được giao. */
    private void assertCanChangeAssignee(Task task, Long actorId, Long newAssigneeId) {
        if (SecurityUtils.isAdmin()) {
            return;
        }

        Long projectId = task.getProject().getProjectId();
        ProjectMember member = projectMemberRepository
                .findByProjectIdAndUserId(projectId, actorId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_ACCESS_DENIED));

        if (member.isManager()) {
            return;
        }

        throw new AppException(ErrorCode.TASK_ACCESS_DENIED);
    }
}
