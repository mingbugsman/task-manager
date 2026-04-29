package com.MMM.taskmanager.dto.response.user;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serial;
import java.io.Serializable;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse implements Serializable {
        @Serial
        private static final long serialVersionUID = 1L;
        String userId;
        String userName;
        String email;
        String status;
        boolean enabled;
}