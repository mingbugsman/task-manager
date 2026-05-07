package com.MMM.taskmanager.dto.request.task;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskCreateRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Task name is required")
    @Size(max = 255, message = "Task name must not exceed 255 characters")
    private String taskName;

    private String taskDescription;

    @Min(value = 1, message = "Priority must be 1, 2, or 3")
    @Max(value = 3, message = "Priority must be 1, 2, or 3")
    private Integer priority = 2;

    private Long assigneeId;

    private Long reporterId;

    private LocalDateTime dueAt;

    private Set<Long> labelIds = new HashSet<>();
}
