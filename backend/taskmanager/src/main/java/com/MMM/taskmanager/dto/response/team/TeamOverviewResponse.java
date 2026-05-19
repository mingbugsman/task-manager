package com.MMM.taskmanager.dto.response.team;

import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamOverviewResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int collaboratorCount;
    private int projectCount;
    private long activeAssignedTaskCount;
}
