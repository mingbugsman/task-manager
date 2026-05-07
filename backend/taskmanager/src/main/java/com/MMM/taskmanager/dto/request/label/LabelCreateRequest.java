package com.MMM.taskmanager.dto.request.label;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabelCreateRequest implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Label name is required")
    @Size(max = 50, message = "Label name must not exceed 50 characters")
    private String labelName;

    private String labelDescription;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6})$", message = "Color code must be a valid hex color (e.g. #FF0000)")
    private String colorCode = "#808080";
}