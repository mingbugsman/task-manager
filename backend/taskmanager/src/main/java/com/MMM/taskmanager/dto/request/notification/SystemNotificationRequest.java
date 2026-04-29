package com.MMM.taskmanager.dto.request.notification;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemNotificationRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    @Schema(description = "Title của thông báo hệ thống")
    private String title;

    @NotBlank(message = "Message is required")
    @Schema(description = "Nội dung thông báo của hệ thống")
    private String message;

    private List<Long> userIds;
}
