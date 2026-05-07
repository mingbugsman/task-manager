package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.label.TaskLabelRequest;
import com.MMM.taskmanager.dto.response.label.TaskLabelResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.TaskLabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/tasks")
public class TaskLabelController {

    private final TaskLabelService taskLabelService;

    // POST /api/v1/tasks/{task_id}/labels
    @PostMapping("/{task_id}/labels")
    public ResponseEntity<ApiResponse<TaskLabelResponse>> attachLabel(
            @PathVariable("task_id") Long taskId,
            @RequestBody @Valid TaskLabelRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(taskLabelService.attachLabelToTask(taskId, request)));
    }

    // DELETE /api/v1/tasks/{task_id}/labels/{label_id}
    @DeleteMapping("/{task_id}/labels/{label_id}")
    public ResponseEntity<ApiResponse<Void>> detachLabel(
            @PathVariable("task_id") Long taskId,
            @PathVariable("label_id") Long labelId
    ) {
        taskLabelService.detachLabelFromTask(taskId, labelId);
        return ResponseEntity.ok(ApiResponse.ok("Label detached from task successfully"));
    }
}