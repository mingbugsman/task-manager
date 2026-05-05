package com.MMM.taskmanager.dto.response.task;

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
public class TaskSummaryResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long taskId;
    private String taskName;
    private Integer priority;
    private String status;
    private UserSummaryResponse assignee;
    private LocalDateTime dueAt;
    private Set<LabelSummaryResponse> labels;
}