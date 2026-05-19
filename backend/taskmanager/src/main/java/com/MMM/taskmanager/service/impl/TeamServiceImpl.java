package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.response.team.*;
import com.MMM.taskmanager.repository.ProjectMemberRepository;
import com.MMM.taskmanager.repository.TaskRepository;
import com.MMM.taskmanager.service.TeamService;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TeamServiceImpl implements TeamService {

    private static final Map<String, Integer> ROLE_PRIORITY = Map.of(
            "ADMIN", 0,
            "LEAD", 1,
            "MEMBER", 2,
            "VIEWER", 3
    );

    ProjectMemberRepository projectMemberRepository;
    TaskRepository taskRepository;

    @Override
    public TeamDirectoryResponse getDirectory() {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        List<Object[]> rows = projectMemberRepository.findCollaboratorProjectRows(currentUserId);
        long projectCount = projectMemberRepository.countDistinctProjectsByUserId(currentUserId);
        long activeAssignedTaskCount =
                taskRepository.countActiveTasksAssignedToOthersInMyProjects(currentUserId);

        Map<Long, CollaboratorAccumulator> byUser = new LinkedHashMap<>();

        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            String userName = (String) row[1];
            String email = (String) row[2];
            String avatarUrl = (String) row[3];
            Long projectId = (Long) row[4];
            String projectName = (String) row[5];
            String role = row[6] != null ? row[6].toString() : "MEMBER";

            CollaboratorAccumulator acc = byUser.computeIfAbsent(userId, id -> new CollaboratorAccumulator(
                    userId, userName, email, avatarUrl
            ));
            acc.addProject(projectId, projectName, role);
        }

        List<Long> collaboratorIds = new ArrayList<>(byUser.keySet());
        Map<Long, Long> taskCountByUser = collaboratorIds.isEmpty()
                ? Map.of()
                : taskRepository.countActiveTasksByAssigneesInMyProjects(currentUserId, collaboratorIds)
                .stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        List<TeamCollaboratorResponse> collaborators = byUser.values().stream()
                .map(acc -> acc.toResponse(taskCountByUser.getOrDefault(acc.userId, 0L)))
                .sorted(Comparator.comparing(TeamCollaboratorResponse::getUserName,
                        Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();

        TeamOverviewResponse overview = TeamOverviewResponse.builder()
                .collaboratorCount(collaborators.size())
                .projectCount((int) projectCount)
                .activeAssignedTaskCount(activeAssignedTaskCount)
                .build();

        return TeamDirectoryResponse.builder()
                .overview(overview)
                .collaborators(collaborators)
                .build();
    }

    private static String resolvePrimaryRole(Collection<String> roles) {
        return roles.stream()
                .map(r -> r != null ? r.toUpperCase(Locale.ROOT) : "MEMBER")
                .min(Comparator.comparingInt(r -> ROLE_PRIORITY.getOrDefault(r, 99)))
                .orElse("MEMBER");
    }

    private static final class CollaboratorAccumulator {
        final Long userId;
        final String userName;
        final String email;
        final String avatarUrl;
        final List<TeamSharedProjectResponse> projects = new ArrayList<>();
        final Set<String> roles = new HashSet<>();

        CollaboratorAccumulator(Long userId, String userName, String email, String avatarUrl) {
            this.userId = userId;
            this.userName = userName;
            this.email = email;
            this.avatarUrl = avatarUrl;
        }

        void addProject(Long projectId, String projectName, String role) {
            projects.add(TeamSharedProjectResponse.builder()
                    .projectId(projectId)
                    .projectName(projectName)
                    .role(role)
                    .build());
            roles.add(role);
        }

        TeamCollaboratorResponse toResponse(long activeTaskCount) {
            projects.sort(Comparator.comparing(
                    TeamSharedProjectResponse::getProjectName,
                    Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)
            ));
            return TeamCollaboratorResponse.builder()
                    .userId(userId)
                    .userName(userName)
                    .email(email)
                    .avatarUrl(avatarUrl)
                    .primaryRole(resolvePrimaryRole(roles))
                    .sharedProjectCount(projects.size())
                    .activeTaskCount(activeTaskCount)
                    .sharedProjects(List.copyOf(projects))
                    .build();
        }
    }
}
