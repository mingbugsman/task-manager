package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.task.*;
import com.MMM.taskmanager.dto.response.task.TaskDetailResponse;
import com.MMM.taskmanager.dto.response.task.TaskStatisticResponse;
import com.MMM.taskmanager.dto.response.task.TaskSummaryResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.TaskService;
import com.MMM.taskmanager.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class TaskController {

    private final TaskService taskService;


    @GetMapping("/projects/{project_id}/tasks")
    public ResponseEntity<ApiResponse<PageResponse<TaskSummaryResponse>>> getTasksByProject(
            @PathVariable("project_id") Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
                taskService.getTasksByProject(projectId, status, search, page, size)
        ));
    }

    // GET /api/v1/tasks/{task_id}
    @GetMapping("/tasks/{task_id}")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> getTaskDetail(
            @PathVariable("task_id") Long taskId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getTaskDetail(taskId)));
    }


    @GetMapping("/tasks/my-tasks")
    public ResponseEntity<ApiResponse<List<TaskSummaryResponse>>> getMyTasks() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(taskService.getMyTasks(userId)));
    }


    @GetMapping("/tasks/{project_id}/statistic")
    public ResponseEntity<ApiResponse<TaskStatisticResponse>> getStatistic(
            @PathVariable("project_id") Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.getStatisticByProject(projectId)));
    }


    @PostMapping("/projects/{project_id}/tasks")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> createTask(
            @PathVariable("project_id") Long projectId,
            @RequestBody @Valid TaskCreateRequest request
    ) {
        Long reporterId = SecurityUtils.getCurrentUserId();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(taskService.createTask(projectId, request, reporterId)));
    }


    @PutMapping("/tasks/{task_id}")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> updateTask(
            @PathVariable("task_id") Long taskId,
            @RequestBody @Valid TaskUpdateRequest request
    ) {
        Long updatedByUserId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(taskService.updateTask(taskId, request, updatedByUserId)));
    }


    @PatchMapping("/tasks/{task_id}/assign")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> assignTask(
            @PathVariable("task_id") Long taskId,
            @RequestBody @Valid TaskAssignRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.assignTask(taskId, request.getUserId())));
    }

    // PATCH /api/v1/tasks/{task_id}/dueat
    @PatchMapping("/tasks/{task_id}/dueat")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> updateDueAt(
            @PathVariable("task_id") Long taskId,
            @RequestBody @Valid TaskDueAtRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.updateDueAt(taskId, request.getDueAt())));
    }


    @PatchMapping("/tasks/{task_id}/status")
    public ResponseEntity<ApiResponse<TaskDetailResponse>> updateStatus(
            @PathVariable("task_id") Long taskId,
            @RequestBody @Valid TaskStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(taskService.updateStatus(taskId, request.getStatus())));
    }


    /** Xóa toàn bộ task trong dự án (không xóa dự án — dùng DELETE /projects/{id} trên ProjectController). */
    @DeleteMapping("/projects/{project_id}/tasks")
    public ResponseEntity<ApiResponse<Void>> deleteAllTasksByProject(
            @PathVariable("project_id") Long projectId
    ) {
        taskService.deleteTasksByProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok("All tasks in project deleted successfully"));
    }


    @DeleteMapping("/tasks/{task_id}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable("task_id") Long taskId
    ) {
        taskService.deleteTask(taskId);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted successfully"));
    }

}