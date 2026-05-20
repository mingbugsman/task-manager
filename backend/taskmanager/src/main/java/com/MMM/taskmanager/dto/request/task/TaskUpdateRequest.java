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
public class TaskUpdateRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Task name is required")
    @Size(max = 255)
    private String taskName;

    private String taskDescription;

    @Min(1) @Max(3)
    private Integer priority;

    private String status;

    private Long assigneeId;

    /** true = bỏ người được giao (assignee = null). */
    private Boolean clearAssignee;

    private Long reporterId;

    private LocalDateTime dueAt;

    private Set<Long> labelIds = new HashSet<>();
}