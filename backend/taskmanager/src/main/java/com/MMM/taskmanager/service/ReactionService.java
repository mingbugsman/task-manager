package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.reaction.ReactionRequest;
import com.MMM.taskmanager.dto.response.reaction.ReactionResponse;

import java.util.List;

public interface ReactionService {
    List<ReactionResponse> getReactions(String entityType, Long entityId);
    ReactionResponse toggleReaction(String entityType, Long entityId, ReactionRequest request);
    void deleteReaction(String entityType, Long entityId);
}
