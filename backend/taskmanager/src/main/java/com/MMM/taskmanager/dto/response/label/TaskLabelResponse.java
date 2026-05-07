package com.MMM.taskmanager.dto.response.label;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskLabelResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long taskId;
    private Long labelId;
    private String labelName;
    private String colorCode;
    private LocalDateTime assignedAt;
}