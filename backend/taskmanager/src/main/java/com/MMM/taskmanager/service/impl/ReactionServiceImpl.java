package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.reaction.ReactionRequest;
import com.MMM.taskmanager.dto.response.reaction.ReactionResponse;
import com.MMM.taskmanager.entity.Reaction;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.ReactionEntityType;
import com.MMM.taskmanager.entity.type.ReactionType;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.repository.ReactionRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.ReactionService;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ReactionServiceImpl implements ReactionService {

    ReactionRepository reactionRepository;
    UserRepository userRepository;

    @Override
    public List<ReactionResponse> getReactions(String entityType, Long entityId) {
        Long userId = SecurityUtils.getCurrentUserId();
        ReactionEntityType type = ReactionEntityType.fromPathVariable(entityType);

        List<Object[]> grouped = reactionRepository.countGroupByReactionType(type, entityId);

        Optional<Reaction> userReaction = reactionRepository
                .findByEntityTypeAndEntityIdAndUser_UserId(type, entityId, userId);

        ReactionType userReactionType = userReaction
                .map(Reaction::getReactionType)
                .orElse(null);
        Map<ReactionType, Long> countMap = grouped.stream()
                .collect(Collectors.toMap(
                        row -> (ReactionType) row[0],
                        row -> (Long) row[1]
                ));


        return Arrays.stream(ReactionType.values())
                .map(rt -> ReactionResponse.builder()
                        .reactionType(rt)
                        .count(countMap.getOrDefault(rt, 0L))
                        .userReacted(rt.equals(userReactionType))
                        .build())
                .toList();
    }

    @Override
    @Transactional
    public ReactionResponse toggleReaction(String entityType, Long entityId, ReactionRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        ReactionEntityType type = ReactionEntityType.fromPathVariable(entityType);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Optional<Reaction> existing = reactionRepository
                .findByEntityTypeAndEntityIdAndUser_UserId(type, entityId, userId);

        if (existing.isPresent()) {
            Reaction reaction = existing.get();

            if (reaction.getReactionType().equals(request.getReactionType())) {

                reactionRepository.delete(reaction);
                log.info("Removed reaction type={} on entityType={} entityId={} by userId={}",
                        request.getReactionType(), type, entityId, userId);

                return ReactionResponse.builder()
                        .reactionType(request.getReactionType())
                        .count(reactionRepository.countGroupByReactionType(type, entityId)
                                .stream()
                                .filter(row -> row[0].equals(request.getReactionType()))
                                .mapToLong(row -> (Long) row[1])
                                .findFirst()
                                .orElse(0L))
                        .userReacted(false)
                        .build();
            } else {
                reactionRepository
                        .findByEntityTypeAndEntityIdAndUser_UserIdAndReactionType(
                                type, entityId, userId, request.getReactionType())
                        .filter(other -> !other.getReactionId().equals(reaction.getReactionId()))
                        .ifPresent(reactionRepository::delete);

                reaction.setReactionType(request.getReactionType());
                reactionRepository.save(reaction);
                log.info("Updated reaction type={} on entityType={} entityId={} by userId={}",
                        request.getReactionType(), type, entityId, userId);
            }
        } else {
            Reaction reaction = Reaction.builder()
                    .user(user)
                    .entityType(type)
                    .entityId(entityId)
                    .reactionType(request.getReactionType())
                    .build();
            reactionRepository.save(reaction);
            log.info("Created reaction type={} on entityType={} entityId={} by userId={}",
                    request.getReactionType(), type, entityId, userId);
        }

        long updatedCount = reactionRepository.countGroupByReactionType(type, entityId)
                .stream()
                .filter(row -> row[0].equals(request.getReactionType()))
                .mapToLong(row -> (Long) row[1])
                .findFirst()
                .orElse(0L);

        return ReactionResponse.builder()
                .reactionType(request.getReactionType())
                .count(updatedCount)
                .userReacted(true)
                .build();
    }

    @Override
    public void deleteReaction(String entityType, Long entityId) {
        Long userId = SecurityUtils.getCurrentUserId();
        ReactionEntityType type = ReactionEntityType.fromPathVariable(entityType);

        reactionRepository.findByEntityTypeAndEntityIdAndUser_UserId(type, entityId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.REACTION_NOT_FOUND));

        reactionRepository.deleteByEntityTypeAndEntityIdAndUser_UserId(type, entityId, userId);
        log.info("Deleted reaction on entityType={} entityId={} by userId={}", type, entityId, userId);
    }
}
