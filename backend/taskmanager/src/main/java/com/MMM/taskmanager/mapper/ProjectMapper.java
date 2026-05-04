package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.request.project.ProjectRequest;
import com.MMM.taskmanager.dto.response.project.ProjectDetailResponse;
import com.MMM.taskmanager.dto.response.project.ProjectSummaryResponse;
import com.MMM.taskmanager.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;


@Mapper(componentModel = "spring")
public interface ProjectMapper {


    @Mapping(target = "createdBy", source = "createdBy.userId")
    @Mapping(target = "createdByUsername", source = "createdBy.userName")
    // calculate in db
    @Mapping(target = "totalTasks", ignore = true)
    @Mapping(target = "todoCount", ignore = true)
    @Mapping(target = "inProgressCount", ignore = true)
    @Mapping(target = "doneCount", ignore = true)
    @Mapping(target = "progressRate", ignore = true)
    @Mapping(target = "memberCount", ignore = true)
    @Mapping(target = "memberAvatarUrls", ignore = true)
    ProjectSummaryResponse toSummaryResponse(Project project);

    List<ProjectSummaryResponse> toSummaryResponseList(List<Project> projects);


    // Project to ProjectDetailResponse
    @Mapping(target = "createdBy", source = "createdBy.userId")
    @Mapping(target = "createdByUsername", source = "createdBy.userName")
    @Mapping(target = "updatedBy", source = "updatedBy.userId")
    @Mapping(target = "updatedByUsername", source = "updatedBy.userName")
    ProjectDetailResponse toDetailResponse(Project project);


    // ProjectRequest to Project
    @Mapping(target = "projectId", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    Project toEntity(ProjectRequest request);
}