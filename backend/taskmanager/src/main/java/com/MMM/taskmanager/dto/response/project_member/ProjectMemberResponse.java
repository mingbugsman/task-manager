package com.MMM.taskmanager.dto.response.project_member;

import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO trả về cho tất cả API liên quan đến ProjectMember:
 * - GET  /api/v1/projects/{project_id}/members
 * - POST /api/v1/projects/{project_id}/members
 * - PATCH /api/v1/projects/{project_id}/members/{user_id}/role
 *
 * Thiết kế:
 * - Nhúng UserSummaryDTO thay vì trả raw userId
 * - isManager: FE dùng để hiển thị badge hoặc ẩn/hiện nút quản lý
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMemberResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long projectMemberId;
    private Long projectId;


    private UserSummaryResponse user;

    /** Field phẳng — FE đọc trực tiếp khi cần, đồng bộ với {@link #user}. */
    private Long userId;
    private String userName;
    private String userEmail;
    private String userAvatarUrl;

    /** Admin / Lead / Member / Viewer */
    private String role;

    /** true nếu role là ADMIN hoặc LEAD - FE dùng để render UI */
    private boolean isManager;

    private LocalDateTime joinedAt;
}