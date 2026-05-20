package com.MMM.taskmanager.entity.type;

import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import lombok.Getter;

/**
 * Enum quản lý vai trò thành viên trong Project.
 * Entity lưu String (displayName), Enum dùng ở tầng Service/Validation.
 *
 * Thứ bậc quyền hạn (từ cao xuống thấp):
 * OWNER > LEAD > MEMBER > VIEWER
 */
@Getter
public enum ProjectRole {

    OWNER("Owner"),
    LEAD("Lead"),
    MEMBER("Member"),
    VIEWER("Reviewer");

    private final String displayName;

    ProjectRole(String displayName) {
        this.displayName = displayName;
    }

    /**
     * Chuyển String từ request / DB -> ProjectRole.
     */
    public static ProjectRole from(String value) {
        if (value == null || value.isBlank()) {
            throw new AppException(ErrorCode.PROJECT_MEMBER_INVALID_ROLE);
        }
        String normalized = value.trim();
        // Alias cũ / FE
        if ("Admin".equalsIgnoreCase(normalized) || "ADMIN".equalsIgnoreCase(normalized)) {
            return OWNER;
        }
        if ("Viewer".equalsIgnoreCase(normalized) || "Người xem".equalsIgnoreCase(normalized)) {
            return VIEWER;
        }
        for (ProjectRole role : values()) {
            if (role.name().equalsIgnoreCase(normalized)
                    || role.displayName.equalsIgnoreCase(normalized)) {
                return role;
            }
        }
        throw new AppException(ErrorCode.PROJECT_MEMBER_INVALID_ROLE);
    }

    /**
     * OWNER: mời được tất cả (OWNER, LEAD, MEMBER, VIEWER)
     * LEAD : chỉ mời được MEMBER, VIEWER
     */
    public boolean canInvite(ProjectRole targetRole) {
        return switch (this) {
            case OWNER -> true;
            case LEAD  -> targetRole == MEMBER || targetRole == VIEWER;
            default    -> false;
        };
    }

    /**
     * OWNER: kick được LEAD, MEMBER, VIEWER (không kick OWNER khác)
     * LEAD : kick được MEMBER, VIEWER
     */
    public boolean canKick(ProjectRole targetRole) {
        return switch (this) {
            case OWNER -> targetRole != OWNER;
            case LEAD  -> targetRole == MEMBER || targetRole == VIEWER;
            default    -> false;
        };
    }

    /** Chỉ OWNER mới được đổi role thành viên. */
    public boolean canChangeRole() {
        return this == OWNER;
    }
}
