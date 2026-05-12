package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.project.ProjectRequest;
import com.MMM.taskmanager.dto.request.project.UpdateProjectStatusRequest;
import com.MMM.taskmanager.dto.response.project.BroadResponse;
import com.MMM.taskmanager.dto.response.project.ProjectDetailResponse;
import com.MMM.taskmanager.dto.response.project.ProjectOverallStatsResponse;
import com.MMM.taskmanager.dto.response.project.ProjectSummaryResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;

public interface ProjectService {
    PageResponse<ProjectSummaryResponse> getProjects(String search, int page, int size);
    ProjectDetailResponse getProjectDetail(Long projectId);
    ProjectOverallStatsResponse getProjectStats();
    BroadResponse getBoardByProjectId(Long projectId, Long assigneeId, Long labelId);
    PageResponse<ProjectSummaryResponse> getAllProjectsForAdmin(String search, boolean includeDeleted, int page, int size);

    // crud project
    ProjectDetailResponse createProject(ProjectRequest request);
    ProjectDetailResponse updateProject(Long projectId, ProjectRequest request);
    ProjectDetailResponse updateProjectStatus(Long projectId, UpdateProjectStatusRequest request);
    ProjectDetailResponse restoreProject(Long projectId);
    void deleteProject(Long projectId);


}
