package com.MMM.taskmanager.dto.response.project_member;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Kết quả tra cứu email trước khi mời thành viên vào dự án.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InviteLookupResponse {

    /** Có tìm thấy tài khoản đã đăng ký với email này không. */
    boolean found;

    Long userId;
    String userName;
    String email;
    String avatarUrl;

    /** User đã là thành viên dự án chưa. */
    boolean alreadyMember;

    String message;
}
