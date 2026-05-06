package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enum quản lý vai trò thành viên trong Project.
 * Entity lưu String, Enum dùng ở tầng Service/Validation.
 *
 * Thứ bậc quyền hạn (từ cao xuống thấp):
 * ADMIN > LEAD > MEMBER > VIEWER
 */
@Getter
public enum ProjectRole {

    ADMIN("Admin"),
    LEAD("Lead"),
    MEMBER("Member"),
    VIEWER("Reviewer");

    private final String displayName;

    ProjectRole(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Chuyển String từ request -> ProjectRole.
     * Ném IllegalArgumentException nếu không hợp lệ.
     */
    public static ProjectRole from(String value) {
        for (ProjectRole role : values()) {
            if (role.name().equalsIgnoreCase(value)
                    || role.displayName.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new AppException(
                ErrorCode.PROJECT_MEMBER_INVALID_ROLE
        );
    }

    /**
     * Kiểm tra role có quyền mời user với role target không.
     *
     * Quy tắc:
     * - ADMIN: mời được tất cả (ADMIN, LEAD, MEMBER, VIEWER)
     * - LEAD : chỉ mời được MEMBER, VIEWER
     * - Còn lại: không có quyền mời
     */
    public boolean canInvite(ProjectRole targetRole) {
        return switch (this) {
            case ADMIN -> true;
            case LEAD  -> targetRole == MEMBER || targetRole == VIEWER;
            default    -> false;
        };
    }

    /**
     * Kiểm tra role có quyền kick user với role target không.
     *
     * Quy tắc:
     * - ADMIN: kick được LEAD, MEMBER, VIEWER (không kick ADMIN khác)
     * - LEAD : kick được MEMBER, VIEWER
     * - Còn lại: không có quyền kick
     */
    public boolean canKick(ProjectRole targetRole) {
        return switch (this) {
            case ADMIN -> targetRole != ADMIN;
            case LEAD  -> targetRole == MEMBER || targetRole == VIEWER;
            default    -> false;
        };
    }

    /**
     * Kiểm tra role có quyền đổi role của target không.
     * Chỉ ADMIN mới được đổi role.
     */
    public boolean canChangeRole() {
        return this == ADMIN;
    }
}
