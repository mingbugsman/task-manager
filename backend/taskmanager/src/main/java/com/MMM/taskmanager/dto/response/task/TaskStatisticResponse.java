package com.MMM.taskmanager.dto.response.task;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskStatisticResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long projectId;
    private long totalTasks;
    private long todoCount;
    private long inProgressCount;
    private long doneCount;
    private long overdueCount;
}