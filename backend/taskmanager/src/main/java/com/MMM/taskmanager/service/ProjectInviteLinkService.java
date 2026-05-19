package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.project_invite.CreateInviteLinkRequest;
import com.MMM.taskmanager.dto.response.project_invite.InviteLinkResponse;
import com.MMM.taskmanager.dto.response.project_invite.InvitePreviewResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;

public interface ProjectInviteLinkService {

    InviteLinkResponse createInviteLink(Long projectId, Long inviterId, CreateInviteLinkRequest request);

    InvitePreviewResponse getInvitePreview(String token);

    ProjectMemberResponse acceptInvite(String token, Long userId);
}
