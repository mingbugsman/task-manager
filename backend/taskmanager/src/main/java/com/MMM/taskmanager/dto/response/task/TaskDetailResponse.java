package com.MMM.taskmanager.dto.response.task;

import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskDetailResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long taskId;
    private Long projectId;
    private String projectName;
    private String taskName;
    private String taskDescription;
    private Integer priority;
    private String status;
    private UserSummaryResponse assignee;
    private UserSummaryResponse reporter;
    private UserSummaryResponse updatedBy;
    private LocalDateTime dueAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Set<LabelSummaryResponse> labels;
}