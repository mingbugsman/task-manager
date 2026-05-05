package com.MMM.taskmanager.dto.request.task;

import jakarta.validation.constraints.NotNull;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

public class TaskDueAtRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Due date is required")
    private LocalDateTime dueAt;
}
