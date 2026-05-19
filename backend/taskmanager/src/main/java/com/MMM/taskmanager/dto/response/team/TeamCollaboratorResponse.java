package com.MMM.taskmanager.dto.response.team;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamCollaboratorResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long userId;
    private String userName;
    private String email;
    private String avatarUrl;
    private String primaryRole;
    private int sharedProjectCount;
    private long activeTaskCount;
    private List<TeamSharedProjectResponse> sharedProjects;
}
