package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.activity_log.ActivityLogRequest;
import com.MMM.taskmanager.dto.request.activity_log.DeleteActivityRequest;
import com.MMM.taskmanager.dto.response.activity_log.ActivityLogResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.ActivityLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1")
@Tag(name = "Activity Log", description = "API quản lý nhật ký hoạt động hệ thống")
public class ActivityLogController {

    ActivityLogService activityLogService;

    // =========================================================
    // GET /api/v1/activities
    // =========================================================
    @Operation(
            summary = "Truy vấn log theo thực thể",
            description = "Lấy lịch sử thay đổi của một thực thể bất kỳ (Task, Project, Comment,...) theo entityType và entityId"
    )
    @GetMapping("/activities")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getActivities(
            @Parameter(description = "Loại thực thể (TASK, PROJECT, COMMENT,...)", example = "TASK")
            @RequestParam String entityType,
            @Parameter(description = "ID của thực thể", example = "1")
            @RequestParam Long entityId,
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        var data = activityLogService.getActivities(entityType, entityId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // =========================================================
    // GET /api/v1/activities/{activityLogId}
    // =========================================================
    @Operation(
            summary = "Xem chi tiết một activity log",
            description = "Lấy đầy đủ thông tin của một activity log bao gồm metadata chi tiết"
    )

    @GetMapping("/activities/{activityLogId}")
    public ResponseEntity<ApiResponse<ActivityLogResponse>> getActivityDetail(
            @Parameter(description = "ID của activity log", example = "1")
            @PathVariable Long activityLogId) {

        var data = activityLogService.getActivityDetail(activityLogId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // =========================================================
    // GET /api/v1/projects/{projectId}/activities
    // =========================================================
    @Operation(
            summary = "Lấy log theo dự án",
            description = "Lấy toàn bộ nhật ký hoạt động diễn ra trong phạm vi một dự án, dùng cho trang Dashboard hoạt động gần đây"
    )

    @GetMapping("/projects/{projectId}/activities")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getActivitiesByProject(
            @Parameter(description = "ID của dự án", example = "1")
            @PathVariable Long projectId,
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        var data = activityLogService.getActivitiesByProject(projectId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // =========================================================
    // GET /api/v1/users/{userId}/activities
    // =========================================================
    @Operation(
            summary = "Lấy log theo người dùng",
            description = "Lấy lịch sử toàn bộ hành động của một người dùng cụ thể trên hệ thống. Chỉ Admin hoặc chính user đó mới có quyền xem"
    )

    @GetMapping("/users/{userId}/activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getActivitiesByUser(
            @Parameter(description = "ID của người dùng", example = "1")
            @PathVariable Long userId,
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        var data = activityLogService.getActivitiesByUser(userId, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // =========================================================
    // GET /api/v1/users/me/activities
    // =========================================================
    @Operation(
            summary = "Lấy log của bản thân",
            description = "Lấy lịch sử toàn bộ hành động của người dùng đang đăng nhập, bao gồm đăng nhập, cập nhật thông tin, thao tác task/project"
    )

    @GetMapping("/users/me/activities")
    public ResponseEntity<ApiResponse<PageResponse<ActivityLogResponse>>> getMyActivities(
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        var data = activityLogService.getMyActivities(page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // =========================================================
    // POST /api/v1/activities — Internal
    // =========================================================
    @Operation(
            summary = "Tạo activity log (Internal)",
            description = "Tạo một bản ghi nhật ký hoạt động mới. API này được gọi nội bộ bởi các service khác (TaskService, ProjectService,...) khi có sự kiện xảy ra"
    )

    @PostMapping("/activities")
    public ResponseEntity<ApiResponse<Void>> createActivityLog(
            @RequestBody @Valid ActivityLogRequest request) {

        activityLogService.createActivityLog(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Activity log created successfully"));
    }

    // =========================================================
    // DELETE /api/v1/admin/activities — Admin only
    // =========================================================
    @Operation(
            summary = "Xóa log cũ theo thời gian (Admin)",
            description = "Xóa toàn bộ activity log trước một mốc thời gian nhất định để giảm tải hệ thống. Chỉ Admin mới có quyền thực hiện"
    )

    @DeleteMapping("/admin/activities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> deleteOldActivityLogs(
            @RequestBody @Valid DeleteActivityRequest request) {

        int deleted = activityLogService.deleteOldActivity(request.getBefore());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("deleted_count", deleted)));
    }
}