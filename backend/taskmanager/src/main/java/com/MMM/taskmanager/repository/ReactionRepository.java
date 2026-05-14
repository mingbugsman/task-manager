package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Reaction;
import com.MMM.taskmanager.entity.type.ReactionEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, Long> {

    List<Reaction> findByEntityTypeAndEntityId(ReactionEntityType entityType, Long entityId);

    Optional<Reaction> findByEntityTypeAndEntityIdAndUser_UserId(ReactionEntityType entityType, Long entityId, Long userId);

    void deleteByEntityTypeAndEntityIdAndUser_UserId(
            ReactionEntityType entityType, Long entityId, Long userId);

    @Query("""
            SELECT r.reactionType, COUNT(r)
            FROM Reaction r
            WHERE r.entityType = :entityType
            AND r.entityId = :entityId
            GROUP BY r.reactionType
            """)
    List<Object[]> countGroupByReactionType(
            @Param("entityType") ReactionEntityType entityType,
            @Param("entityId") Long entityId);
}
