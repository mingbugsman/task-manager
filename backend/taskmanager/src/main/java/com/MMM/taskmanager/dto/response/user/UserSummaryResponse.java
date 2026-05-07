package com.MMM.taskmanager.dto.response.user;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummaryResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String userName;

    /**
     * URL ảnh đại diện
     * null nếu user chưa cài avatar -> FE fallback về ảnh mặc định
     */
    private String avatarUrl;
}
