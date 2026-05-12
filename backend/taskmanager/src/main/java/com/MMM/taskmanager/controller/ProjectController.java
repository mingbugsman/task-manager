package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.project.ProjectRequest;
import com.MMM.taskmanager.dto.request.project.UpdateProjectStatusRequest;
import com.MMM.taskmanager.dto.response.project.BoardResponse;
import com.MMM.taskmanager.dto.response.project.ProjectDetailResponse;
import com.MMM.taskmanager.dto.response.project.ProjectOverallStatsResponse;
import com.MMM.taskmanager.dto.response.project.ProjectSummaryResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1")
@Tag(name = "Project", description = "API quản lý dự án")
public class ProjectController {
    ProjectService projectService;



    @Operation(
            summary = "Lấy thống kê tổng quan dự án",
            description = "Lấy số liệu tổng quan: tổng dự án, tổng tác vụ, đang thực hiện, TB tiến độ — dùng cho header màn hình Tất Cả Dự Án"
    )
    @GetMapping("/projects/stats")
    public ResponseEntity<ApiResponse<ProjectOverallStatsResponse>> getProjectStats() {
        var data = projectService.getProjectStats();
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(
            summary = "Lấy danh sách dự án",
            description = "Lấy danh sách tất cả dự án mà người dùng đang tham gia, hỗ trợ tìm kiếm và phân trang"
    )
    @GetMapping("/projects")
    public ResponseEntity<ApiResponse<PageResponse<ProjectSummaryResponse>>> getProjects(
            @Parameter(description = "Từ khóa tìm kiếm tên dự án", example = "task-manager")
            @RequestParam(required = false) String search,
            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        var data = projectService.getProjects(search, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(
            summary = "Lấy dữ liệu Kanban board",
            description = "Lấy toàn bộ dữ liệu để vẽ bảng Kanban gồm 4 cột: Cần Làm, Đang Làm, Đang Review, Hoàn Thành. Hỗ trợ lọc theo người được giao và nhãn"
    )
    @GetMapping("/projects/{projectId}/board")
    public ResponseEntity<ApiResponse<BoardResponse>> getBoardByProjectId(
            @Parameter(description = "ID của dự án", example = "1")
            @PathVariable Long projectId,
            @Parameter(description = "Lọc theo ID người được giao task", example = "1")
            @RequestParam(required = false) Long assigneeId,
            @Parameter(description = "Lọc theo ID nhãn", example = "1")
            @RequestParam(required = false) Long labelId) {

        var data = projectService.getBoardByProjectId(projectId, assigneeId, labelId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }


    @Operation(
            summary = "Xem chi tiết dự án",
            description = "Lấy thông tin chi tiết của một dự án. Chỉ thành viên trong dự án hoặc Admin mới có quyền xem"
    )
    @GetMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> getProjectDetail(
            @Parameter(description = "ID của dự án", example = "1")
            @PathVariable Long projectId) {

        var data = projectService.getProjectDetail(projectId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(
            summary = "Tạo dự án mới",
            description = "Tạo một dự án mới. Người tạo sẽ tự động được thêm vào dự án với role ADMIN"
    )

    @PostMapping("/projects")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> createProject(
            @RequestBody @Valid ProjectRequest request) {

        var data = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(data));
    }


    @Operation(
            summary = "Cập nhật thông tin dự án",
            description = "Cập nhật tên và mô tả dự án. Chỉ ADMIN của dự án hoặc Admin hệ thống mới có quyền"
    )
    @PatchMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> updateProject(
            @Parameter(description = "ID của dự án", example = "1")
            @PathVariable Long projectId,
            @RequestBody @Valid ProjectRequest request) {

        var data = projectService.updateProject(projectId, request);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }


    @Operation(
            summary = "Cập nhật trạng thái dự án",
            description = "Cập nhật nhanh trạng thái dự án (ACTIVE, ON_HOLD, COMPLETED, ARCHIVED). Chỉ ADMIN của dự án hoặc Admin hệ thống mới có quyền"
    )

    @PatchMapping("/projects/{projectId}/status")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> updateProjectStatus(
            @Parameter(description = "ID của dự án", example = "1")
            @PathVariable Long projectId,
            @RequestBody @Valid UpdateProjectStatusRequest request) {

        var data = projectService.updateProjectStatus(projectId, request);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(
            summary = "Khôi phục dự án đã xóa",
            description = "Khôi phục lại dự án đã bị xóa mềm. Chỉ người tạo dự án hoặc Admin hệ thống mới có quyền"
    )
    @PatchMapping("/projects/{projectId}/restore")
    public ResponseEntity<ApiResponse<ProjectDetailResponse>> restoreProject(
            @Parameter(description = "ID của dự án cần khôi phục", example = "1")
            @PathVariable Long projectId) {

        var data = projectService.restoreProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(
            summary = "Xóa dự án",
            description = "Xóa mềm dự án bằng cách đánh dấu deleted_at. Dự án sẽ không hiển thị trên giao diện. Chỉ ADMIN của dự án hoặc Admin hệ thống mới có quyền"
    )
    @DeleteMapping("/projects/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @Parameter(description = "ID của dự án cần xóa", example = "1")
            @PathVariable Long projectId) {

        projectService.deleteProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully"));
    }

    @Operation(
            summary = "Admin — Lấy tất cả dự án",
            description = "Admin xem toàn bộ dự án trong hệ thống, hỗ trợ tìm kiếm và lọc theo trạng thái xóa"
    )
    @GetMapping("/admin/projects")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ProjectSummaryResponse>>> getAllProjectsForAdmin(
            @Parameter(description = "Từ khóa tìm kiếm", example = "task-manager")
            @RequestParam(required = false) String search,
            @Parameter(description = "Bao gồm cả dự án đã xóa", example = "false")
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @Parameter(description = "Số trang", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Số lượng mỗi trang", example = "20")
            @RequestParam(defaultValue = "20") int size) {

        var data = projectService.getAllProjectsForAdmin(search, includeDeleted, page, size);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

}
