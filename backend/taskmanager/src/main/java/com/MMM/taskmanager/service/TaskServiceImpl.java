package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.task.TaskCreateRequest;
import com.MMM.taskmanager.dto.request.task.TaskUpdateRequest;
import com.MMM.taskmanager.dto.response.task.TaskDetailResponse;
import com.MMM.taskmanager.dto.response.task.TaskStatisticResponse;
import com.MMM.taskmanager.dto.response.task.TaskSummaryResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Label;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.Task;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.mapper.TaskMapper;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.TaskRepository;
import com.MMM.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final TaskMapper taskMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tasks", key = "'project:' + #projectId + ':status:' + #status + ':search:' + #search + ':page:' + #page + ':size:' + #size")
    public PageResponse<TaskSummaryResponse> getTasksByProject(Long projectId, String status, String search, int page, int size) {
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

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "task", key = "#taskId")
    public TaskDetailResponse getTaskDetail(Long taskId) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));
        return taskMapper.toDetailResponse(task);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "myTasks", key = "#userId")
    public List<TaskSummaryResponse> getMyTasks(Long userId) {
        List<Task> tasks = taskRepository.findMyTasks(userId);
        return taskMapper.toSummaryResponseList(tasks);
    }

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

    @Override
    @CacheEvict(value = "tasks", allEntries = true)
    public TaskDetailResponse createTask(Long projectId, TaskCreateRequest request, Long reporterId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + projectId));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found: " + reporterId));

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.getAssigneeId()));
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
        return taskMapper.toDetailResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskDetailResponse updateTask(Long taskId, TaskUpdateRequest request, Long updatedByUserId) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));

        User updatedBy = userRepository.findById(updatedByUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + updatedByUserId));

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.getAssigneeId()));
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
        return taskMapper.toDetailResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskDetailResponse assignTask(Long taskId, Long assigneeUserId) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        User assignee = userRepository.findById(assigneeUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeUserId));
        task.setAssignee(assignee);
        return taskMapper.toDetailResponse(taskRepository.save(task));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskDetailResponse updateDueAt(Long taskId, LocalDateTime dueAt) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        task.setDueAt(dueAt);
        return taskMapper.toDetailResponse(taskRepository.save(task));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskDetailResponse updateStatus(Long taskId, String status) {
        Task task = taskRepository.findDetailById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        task.setStatus(status);
        return taskMapper.toDetailResponse(taskRepository.save(task));
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "myTasks", allEntries = true)
    })
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found: " + taskId));
        task.setDeletedAt(LocalDateTime.now());
        taskRepository.save(task);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "tasks", allEntries = true),
            @CacheEvict(value = "task", allEntries = true),
            @CacheEvict(value = "myTasks", allEntries = true)
    })
    public void deleteTasksByProject(Long projectId) {
        taskRepository.softDeleteByProjectId(projectId, LocalDateTime.now());
    }
}