package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.project.ProjectRequest;
import com.MMM.taskmanager.dto.request.project.UpdateProjectStatusRequest;
import com.MMM.taskmanager.dto.response.project.BoardResponse;
import com.MMM.taskmanager.dto.response.project.ProjectAnalyticsResponse;
import com.MMM.taskmanager.dto.response.project.ProjectDetailResponse;
import com.MMM.taskmanager.dto.response.project.ProjectOverallStatsResponse;
import com.MMM.taskmanager.dto.response.project.ProjectSummaryResponse;
import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;

import java.util.List;

public interface ProjectService {
    PageResponse<ProjectSummaryResponse> getProjects(String search, int page, int size);
    ProjectDetailResponse getProjectDetail(Long projectId);
    ProjectOverallStatsResponse getProjectStats();
    BoardResponse getBoardByProjectId(Long projectId, Long assigneeId, Long labelId);
    ProjectAnalyticsResponse getAnalytics(Long projectId);
    PageResponse<ProjectSummaryResponse> getAllProjectsForAdmin(String search, boolean includeDeleted, int page, int size);

    // crud project
    ProjectDetailResponse createProject(ProjectRequest request);
    ProjectDetailResponse updateProject(Long projectId, ProjectRequest request);
    ProjectDetailResponse updateProjectStatus(Long projectId, UpdateProjectStatusRequest request);
    ProjectDetailResponse restoreProject(Long projectId);
    void deleteProject(Long projectId);


}
