package com.MMM.taskmanager.controller;


import com.MMM.taskmanager.dto.request.project_member.InviteMemberRequest;
import com.MMM.taskmanager.dto.request.project_member.UpdateMemberRoleRequest;
import com.MMM.taskmanager.dto.response.project_member.MemberStatisticResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.ProjectMemberService;
import com.MMM.taskmanager.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    // =========================================================================
    // 1. GET
    // =========================================================================

    /**
     * GET /api/v1/projects/{projectId}/members?role=...&page=0&size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProjectMemberResponse>>> getMembers(
            @PathVariable Long projectId,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("GET /projects/{}/members - role={}", projectId, role);
        PageResponse<ProjectMemberResponse> result =
                projectMemberService.getMembers(projectId, role, page, size);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * GET /api/v1/projects/{projectId}/members/statistic
     */
    @GetMapping("/statistic")
    public ResponseEntity<ApiResponse<MemberStatisticResponse>> getMemberStatistic(
            @PathVariable Long projectId
    ) {
        log.debug("GET /projects/{}/members/statistic", projectId);
        MemberStatisticResponse result = projectMemberService.getMemberStatistic(projectId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }


    // 2. INVITE

    /**
     * POST /api/v1/projects/{projectId}/members
     * ADMIN mời tất cả, LEAD chỉ mời MEMBER/VIEWER
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> inviteMember(
            @PathVariable Long projectId,
            @Valid @RequestBody InviteMemberRequest request
    ) {
        Long inviterId = SecurityUtils.getCurrentUserId();
        log.debug("POST /projects/{}/members - inviterId={}, targetUserId={}",
                projectId, inviterId, request.getUserId());
        ProjectMemberResponse result =
                projectMemberService.inviteMember(projectId, inviterId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result));
    }

    // =========================================================================
    // 3. UPDATE ROLE
    // =========================================================================

    /**
     * PATCH /api/v1/projects/{projectId}/members/{userId}/role
     * Chỉ ADMIN mới được đổi role
     *
     * Lưu ý: endpoint /{userId}/role phải đặt TRƯỚC /leave
     * để Spring không nhầm "leave" là userId
     */
    @PatchMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> updateRole(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateMemberRoleRequest request
    ) {
        Long adminId = SecurityUtils.getCurrentUserId();
        log.debug("PATCH /projects/{}/members/{}/role - adminId={}", projectId, userId, adminId);
        ProjectMemberResponse result =
                projectMemberService.updateRole(projectId, adminId, userId, request);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }


    // 4. KICK

    /**
     * DELETE /api/v1/projects/{projectId}/members/{userId}
     * ADMIN kick được LEAD/MEMBER/VIEWER, LEAD kick được MEMBER/VIEWER
     *
     * Lưu ý: endpoint /{userId} phải đặt SAU /leave
     * để Spring không nhầm "leave" là userId
     */
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> kickMember(
            @PathVariable Long projectId,
            @PathVariable Long userId

    ) {
        Long kickerId = SecurityUtils.getCurrentUserId();
        log.debug("DELETE /projects/{}/members/{} - kickerId={}", projectId, userId, kickerId);
        projectMemberService.kickMember(projectId, kickerId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Đã kick thành viên khỏi dự án"));
    }


    // 5. LEAVE


    /**
     * DELETE /api/v1/projects/{projectId}/members/leave
     * ADMIN không được rời nếu là ADMIN duy nhất
     *
     * Lưu ý: /leave phải đặt TRƯỚC /{userId}
     * để Spring ưu tiên match "leave" thay vì coi là PathVariable
     */
    @DeleteMapping("/leave")
    public ResponseEntity<ApiResponse<Void>> leaveProject(
            @PathVariable Long projectId
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.debug("DELETE /projects/{}/members/leave - userId={}", projectId, userId);
        projectMemberService.leaveProject(projectId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Bạn đã rời khỏi dự án thành công"));
    }

}
