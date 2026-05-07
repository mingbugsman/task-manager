package com.MMM.taskmanager.dto.response.label;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabelResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long labelId;
    private Long projectId;
    private String labelName;
    private String labelDescription;
    private String colorCode;
}