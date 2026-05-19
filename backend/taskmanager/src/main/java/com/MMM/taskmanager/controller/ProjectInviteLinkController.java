package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.project_invite.CreateInviteLinkRequest;
import com.MMM.taskmanager.dto.response.project_invite.InviteLinkResponse;
import com.MMM.taskmanager.dto.response.project_invite.InvitePreviewResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.ProjectInviteLinkService;
import com.MMM.taskmanager.util.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ProjectInviteLinkController {

    private final ProjectInviteLinkService inviteLinkService;

    /**
     * POST /api/v1/projects/{projectId}/invite-links
     */
    @PostMapping("/api/v1/projects/{projectId}/invite-links")
    public ResponseEntity<ApiResponse<InviteLinkResponse>> createInviteLink(
            @PathVariable Long projectId,
            @Valid @RequestBody CreateInviteLinkRequest request
    ) {
        Long inviterId = SecurityUtils.getCurrentUserId();
        InviteLinkResponse result = inviteLinkService.createInviteLink(projectId, inviterId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(result));
    }

    /**
     * GET /api/v1/invites/{token} — công khai, xem trước lời mời
     */
    @GetMapping("/api/v1/invites/{token}")
    public ResponseEntity<ApiResponse<InvitePreviewResponse>> getInvitePreview(
            @PathVariable String token
    ) {
        InvitePreviewResponse result = inviteLinkService.getInvitePreview(token);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /**
     * POST /api/v1/invites/{token}/accept — chỉ người đã đăng nhập
     */
    @PostMapping("/api/v1/invites/{token}/accept")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> acceptInvite(
            @PathVariable String token
    ) {
        Long userId = SecurityUtils.getCurrentUserId();
        ProjectMemberResponse result = inviteLinkService.acceptInvite(token, userId);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}
