package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import com.MMM.taskmanager.entity.ProjectMember;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ProjectMemberMapper {

    @Mapping(target = "projectId",  source = "project.projectId")
    @Mapping(target = "user",       source = "member")
    @Mapping(target = "isManager",  expression = "java(member.isManager())")
    ProjectMemberResponse toResponseDTO(ProjectMember member);

}