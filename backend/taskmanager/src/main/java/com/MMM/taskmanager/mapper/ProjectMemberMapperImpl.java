package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.project_member.ProjectMemberResponse;
import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import com.MMM.taskmanager.entity.ProjectMember;
import com.MMM.taskmanager.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * Map đúng user từ {@code member.getUser()} (JOIN FETCH trong repository).
 */
@Component
@RequiredArgsConstructor
public class ProjectMemberMapperImpl implements ProjectMemberMapper {

    private final UserMapper userMapper;

    @Override
    public ProjectMemberResponse toResponseDTO(ProjectMember member) {
        if (member == null) {
            return null;
        }

        User user = member.getUser();
        UserSummaryResponse userSummary = user != null ? userMapper.toUserSummary(user) : null;

        Long projectId = member.getProject() != null ? member.getProject().getProjectId() : null;

        return ProjectMemberResponse.builder()
                .projectMemberId(member.getProjectMemberId())
                .projectId(projectId)
                .user(userSummary)
                .userId(userSummary != null ? userSummary.getUserId() : null)
                .userName(userSummary != null ? userSummary.getUserName() : null)
                .userEmail(userSummary != null ? userSummary.getEmail() : null)
                .userAvatarUrl(userSummary != null ? userSummary.getAvatarUrl() : null)
                .role(member.getRole())
                .isManager(member.isManager())
                .joinedAt(member.getJoinedAt())
                .build();
    }
}
