package com.MMM.taskmanager.dto.response.project;

import com.MMM.taskmanager.entity.type.ProjectStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectSummaryResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long projectId;
    private String projectName;
    private String projectDescription;
    private ProjectStatus status;
    private Long createdBy;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}