package com.MMM.taskmanager.dto.response.notification;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AdminNotificationResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long notificationId;
    private Long recipientUserId;
    private String recipientUserName;
    private String recipientEmail;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
