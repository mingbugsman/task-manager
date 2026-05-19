package com.MMM.taskmanager.dto.request.project_invite;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CreateInviteLinkRequest {

    @NotBlank(message = "Role is required")
    String role;

    /** Số ngày hết hạn (tùy chọn). Null hoặc <= 0 = không hết hạn. */
    Integer expiresInDays;
}
