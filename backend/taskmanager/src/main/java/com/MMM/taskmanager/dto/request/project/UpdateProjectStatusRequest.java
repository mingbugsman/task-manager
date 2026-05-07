package com.MMM.taskmanager.dto.request.project;


import com.MMM.taskmanager.entity.type.ProjectStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProjectStatusRequest {
    @NotNull(message = "Status is required")
    private ProjectStatus status;
}
