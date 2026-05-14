package com.MMM.taskmanager.dto.request.reaction;

import com.MMM.taskmanager.entity.type.ReactionType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;

@Getter
public class ReactionRequest {
    @NotNull(message = "Reaction type is required")
    private ReactionType reactionType;

}
