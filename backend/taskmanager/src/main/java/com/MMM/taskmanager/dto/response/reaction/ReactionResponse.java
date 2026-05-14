package com.MMM.taskmanager.dto.response.reaction;

import com.MMM.taskmanager.entity.type.ReactionType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReactionResponse {
    private ReactionType reactionType;
    private long count;
    private boolean userReacted;
}
