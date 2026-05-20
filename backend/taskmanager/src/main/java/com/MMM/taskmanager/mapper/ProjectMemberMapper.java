package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.entity.ProjectMember;

public interface ProjectMemberMapper {

    ProjectMemberResponse toResponseDTO(ProjectMember member);
}
