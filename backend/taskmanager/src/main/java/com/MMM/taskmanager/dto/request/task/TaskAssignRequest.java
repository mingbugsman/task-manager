package com.MMM.taskmanager.dto.request.task;

import jakarta.validation.constraints.NotNull;

import java.io.Serial;
import java.io.Serializable;

public class TaskAssignRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "User ID is required")
    private Long userId;
}
