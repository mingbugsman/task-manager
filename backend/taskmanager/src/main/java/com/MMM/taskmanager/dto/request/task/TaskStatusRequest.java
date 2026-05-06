package com.MMM.taskmanager.dto.request.task;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TaskStatusRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Status is required")
    private String status;
}