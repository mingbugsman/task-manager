package com.MMM.taskmanager.dto.request.label;

import jakarta.validation.constraints.NotNull;
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
public class TaskLabelRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotNull(message = "Label ID is required")
    private Long labelId;
}