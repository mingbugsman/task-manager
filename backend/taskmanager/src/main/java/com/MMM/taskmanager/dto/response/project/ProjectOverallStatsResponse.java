package com.MMM.taskmanager.dto.response.project;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProjectOverallStatsResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private int totalProjects;
    private int totalTasks;
    private int totalInProgress;
    private double avgProgressRate;
}
