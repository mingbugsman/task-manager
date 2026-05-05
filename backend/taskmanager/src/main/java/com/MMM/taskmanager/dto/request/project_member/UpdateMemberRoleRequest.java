package com.MMM.taskmanager.dto.request.project_member;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

/**
 * DTO dùng cho:
 * PATCH /api/v1/projects/{project_id}/members/{user_id}/role
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateMemberRoleRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * Giá trị hợp lệ: ADMIN, LEAD, MEMBER, VIEWER
     * Validate qua ProjectRole.from() ở tầng Service
     */
    @NotBlank(message = "Role không được để trống")
    private String role;
}
