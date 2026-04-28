package com.MMM.taskmanager.dto.response.user;


import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.io.Serial;
import java.io.Serializable;

@FieldDefaults(level = AccessLevel.PRIVATE)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    String userId;
    String userName;
    String email;
    String avatarUrl;
    String status;
    boolean enabled;
}

