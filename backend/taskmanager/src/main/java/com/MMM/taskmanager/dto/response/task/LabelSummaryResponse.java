package com.MMM.taskmanager.dto.response.task;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabelSummaryResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long labelId;
    private String labelName;
    private String color;
}