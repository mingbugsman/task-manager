package com.MMM.taskmanager.service;


import com.MMM.taskmanager.dto.request.project_member.InviteMemberRequest;
import com.MMM.taskmanager.dto.request.project_member.UpdateMemberRoleRequest;
import com.MMM.taskmanager.dto.response.project_member.InviteLookupResponse;
import com.MMM.taskmanager.dto.response.project_member.MemberStatisticResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;

public interface ProjectMemberService {

    /**
     * GET /api/v1/projects/{projectId}/members?role=...&page=0&size=20
     */
    PageResponse<ProjectMemberResponse> getMembers(
            Long projectId, String role, int page, int size
    );

    /**
     * GET thống kê member theo role trong project
     */
    MemberStatisticResponse getMemberStatistic(Long projectId);

    /**
     * GET lookup by email — chỉ tài khoản đã đăng ký mới được mời
     */
    InviteLookupResponse lookupInvitee(Long projectId, Long inviterId, String email);

    /**
     * POST /api/v1/projects/{projectId}/members
     * ADMIN mời tất cả, LEAD chỉ mời MEMBER/VIEWER
     */
    ProjectMemberResponse inviteMember(
            Long projectId, Long inviterId, InviteMemberRequest request
    );

    /**
     * PATCH /api/v1/projects/{projectId}/members/{userId}/role
     * Chỉ ADMIN mới được đổi role
     */
    ProjectMemberResponse updateRole(
            Long projectId, Long adminId, Long targetUserId, UpdateMemberRoleRequest request
    );

    /**
     * DELETE /api/v1/projects/{projectId}/members/{userId}
     * ADMIN kick được LEAD/MEMBER/VIEWER, LEAD kick được MEMBER/VIEWER
     */
    void kickMember(Long projectId, Long kickerId, Long targetUserId);

    /**
     * DELETE /api/v1/projects/{projectId}/members/leave
     * ADMIN không được rời nếu là ADMIN duy nhất
     */
    void leaveProject(Long projectId, Long userId);
}
