package com.MMM.taskmanager.dto.request.project;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjetRequest {
    @NotBlank(message = "Project name is required")
    @Size(max = 255, message = "Project name must not exceed 255 characters")
    private String projectName;

    private String projectDescription;
}
