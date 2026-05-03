package com.MMM.taskmanager.dto.request.activity_log;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteActivityRequest {
    @NotNull(message = "Before date is required")
    private LocalDateTime before;
}
