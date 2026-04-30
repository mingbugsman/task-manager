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
public class NotificationResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

     Long notificationId;
     String title;
     String message;
     String type;
     String entityType;
     Long entityId;
     Boolean isRead;
     LocalDateTime createdAt;

}
