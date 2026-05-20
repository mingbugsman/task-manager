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
public class TeamDirectoryResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private TeamOverviewResponse overview;
    private List<TeamCollaboratorResponse> collaborators;
}
