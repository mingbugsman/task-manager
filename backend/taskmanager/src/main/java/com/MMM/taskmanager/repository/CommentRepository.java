package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    int countByParent_CommentIdAndDeletedAtIsNull(long parentId);

    int countByTask_TaskIdAndDeletedAtIsNull(Long taskId);

    boolean existsByCommentIdAndUser_UserIdAndDeletedAtIsNull(Long commentId, Long userId);

    boolean existsByCommentIdAndTask_TaskIdAndDeletedAtIsNull(Long commentId, Long taskId);

    // only retrieve comment root, not be deleted, pageable
    @Query(
            value = """
                    SELECT c From Comment c
                    JOIN FETCH c.user u
                    WHERE c.task.taskId = :taskId
                    AND c.parent IS NULL
                    AND c.deletedAt IS NULL
                    ORDER BY c.createdAt ASC
                    """,
            countQuery = """
                    SELECT COUNT(c) FROM Comment c
                    WHERE c.task.taskId = :taskId
                    AND c.parent IS NULL
                    AND c.deletedAt IS NULL
                    """
    )
    Page<Comment> findRootCommentsByTaskId(
            @Param("taskId") Long taskId,
            Pageable pageable
    );


    @Query("""
            SELECT c FROM Comment c
            JOIN FETCH c.user u
            WHERE c.parent.commentId = :parentId
            AND c.deletedAt IS NULL
            ORDER BY c.createdAt ASC
            """)
    List<Comment> findRepliesByParentId(@Param("parentId") Long parentId);

    @Query("""
            SELECT c FROM Comment c
            JOIN FETCH c.user u
            JOIN FETCH c.task t
            WHERE c.commentId = :commentId
            AND c.deletedAt IS NULL
            """)
    Optional<Comment> findActiveById(@Param("commentId") Long commentId);

    /**
     * Soft delete a whole replies of parent comment.
     * use when soft delete parent comment.
     */
    @Modifying
    @Query("""
            UPDATE Comment c
            SET c.deletedAt = :deletedAt
            WHERE c.parent.commentId = :parentId
            AND c.deletedAt IS NULL
            """)
    void softDeleteRepliesByParentId(
            @Param("parentId") Long parentId,
            @Param("deletedAt") LocalDateTime deletedAt
    );

    /**
     * Soft delete all comment of task.
     * use when soft delete task (cascade).
     */
    @Modifying
    @Query("""
            UPDATE Comment c
            SET c.deletedAt = :deletedAt
            WHERE c.task.taskId = :taskId
            AND c.deletedAt IS NULL
            """)
    void softDeleteAllByTaskId(
            @Param("taskId") Long taskId,
            @Param("deletedAt") LocalDateTime deletedAt
    );
}
