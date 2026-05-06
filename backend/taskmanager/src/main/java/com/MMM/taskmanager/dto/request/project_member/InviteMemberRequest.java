package com.MMM.taskmanager.dto.request.project_member;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

/**
 * DTO dùng cho:
 * POST /api/v1/projects/{project_id}/members - mời thành viên vào project
 *
 * Lưu ý:
 * - projectId lấy từ @PathVariable
 * - role validate qua ProjectRole.from() ở tầng Service
 * - Mặc định "Member" nếu không truyền role
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InviteMemberRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "userId không được để trống")
    private Long userId;

    /**
     * Giá trị hợp lệ: ADMIN, LEAD, MEMBER, VIEWER
     * Mặc định MEMBER nếu không truyền
     */
    @Builder.Default
    private final String role = "Member";
}
