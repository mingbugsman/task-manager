package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.task.TaskCreateRequest;
import com.MMM.taskmanager.dto.request.task.TaskUpdateRequest;
import com.MMM.taskmanager.dto.response.task.TaskDetailResponse;
import com.MMM.taskmanager.dto.response.task.TaskStatisticResponse;
import com.MMM.taskmanager.dto.response.task.TaskSummaryResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;

import java.time.LocalDateTime;
import java.util.List;

public interface TaskService {

    PageResponse<TaskSummaryResponse> getTasksByProject(Long projectId, String status, String search, int page, int size);

    TaskDetailResponse getTaskDetail(Long taskId);

    List<TaskSummaryResponse> getMyTasks(Long userId);

    TaskStatisticResponse getStatisticByProject(Long projectId);

    TaskDetailResponse createTask(Long projectId, TaskCreateRequest request, Long reporterId);

    TaskDetailResponse updateTask(Long taskId, TaskUpdateRequest request, Long updatedByUserId);

    TaskDetailResponse assignTask(Long taskId, Long assigneeUserId);

    TaskDetailResponse updateDueAt(Long taskId, LocalDateTime dueAt);

    TaskDetailResponse updateStatus(Long taskId, String status);

    void deleteTask(Long taskId);

    void deleteTasksByProject(Long projectId);
}