package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.label.LabelCreateRequest;
import com.MMM.taskmanager.dto.request.label.LabelUpdateRequest;
import com.MMM.taskmanager.dto.response.label.LabelResponse;
import com.MMM.taskmanager.dto.response.task.LabelSummaryResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.LabelService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class LabelController {

    private final LabelService labelService;

    // GET /api/v1/projects/{project_id}/labels
    @GetMapping("/projects/{project_id}/labels")
    public ResponseEntity<ApiResponse<List<LabelResponse>>> getLabelsByProject(
            @PathVariable("project_id") Long projectId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(labelService.getLabelsByProject(projectId)));
    }

    // POST /api/v1/projects/{project_id}/labels
    @PostMapping("/projects/{project_id}/labels")
    public ResponseEntity<ApiResponse<LabelSummaryResponse>> createLabel(
            @PathVariable("project_id") Long projectId,
            @RequestBody @Valid LabelCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(labelService.createLabel(projectId, request)));
    }

    // PUT /api/v1/labels/{label_id}
    @PutMapping("/labels/{label_id}")
    public ResponseEntity<ApiResponse<LabelSummaryResponse>> updateLabel(
            @PathVariable("label_id") Long labelId,
            @RequestBody @Valid LabelUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(labelService.updateLabel(labelId, request)));
    }

    // DELETE /api/v1/labels/{label_id}
    @DeleteMapping("/labels/{label_id}")
    public ResponseEntity<ApiResponse<Void>> deleteLabel(
            @PathVariable("label_id") Long labelId
    ) {
        labelService.deleteLabel(labelId);
        return ResponseEntity.ok(ApiResponse.ok("Label deleted successfully"));
    }
}