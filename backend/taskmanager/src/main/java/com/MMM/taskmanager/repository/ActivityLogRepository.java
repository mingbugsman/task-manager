package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.ActivityLog;
import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {


    // query log entity type and entity id
    Page<ActivityLog> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(ActivityLogEntityType entityType, Long entityId, Pageable pageable);


    // get detail activity log
    Optional<ActivityLog> findByActivityLogId(Long activityLogId);

    // log by project (FK trực tiếp)
    Page<ActivityLog> findByProject_ProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);

    /**
     * Toàn bộ hoạt động trong phạm vi dự án: log gắn project_id, task thuộc dự án,
     * comment trên task, hoặc thao tác trên chính project.
     */
    @Query(
            value = """
                    SELECT DISTINCT a FROM ActivityLog a
                    JOIN FETCH a.user u
                    LEFT JOIN FETCH a.project p
                    WHERE (p IS NOT NULL AND p.projectId = :projectId)
                       OR (a.entityType = com.MMM.taskmanager.entity.type.ActivityLogEntityType.PROJECT
                           AND a.entityId = :projectId)
                       OR (a.entityType = com.MMM.taskmanager.entity.type.ActivityLogEntityType.TASK
                           AND EXISTS (
                               SELECT 1 FROM Task t
                               WHERE t.taskId = a.entityId AND t.project.projectId = :projectId
                           ))
                       OR (a.entityType = com.MMM.taskmanager.entity.type.ActivityLogEntityType.COMMENT
                           AND EXISTS (
                               SELECT 1 FROM Comment c
                               WHERE c.commentId = a.entityId AND c.task.project.projectId = :projectId
                           ))
                    ORDER BY a.createdAt DESC
                    """,
            countQuery = """
                    SELECT COUNT(DISTINCT a.activityLogId) FROM ActivityLog a
                    LEFT JOIN a.project p
                    WHERE (p IS NOT NULL AND p.projectId = :projectId)
                       OR (a.entityType = com.MMM.taskmanager.entity.type.ActivityLogEntityType.PROJECT
                           AND a.entityId = :projectId)
                       OR (a.entityType = com.MMM.taskmanager.entity.type.ActivityLogEntityType.TASK
                           AND EXISTS (
                               SELECT 1 FROM Task t
                               WHERE t.taskId = a.entityId AND t.project.projectId = :projectId
                           ))
                       OR (a.entityType = com.MMM.taskmanager.entity.type.ActivityLogEntityType.COMMENT
                           AND EXISTS (
                               SELECT 1 FROM Comment c
                               WHERE c.commentId = a.entityId AND c.task.project.projectId = :projectId
                           ))
                    """
    )
    Page<ActivityLog> findByProjectScope(@Param("projectId") Long projectId, Pageable pageable);

    // log by user
    Page<ActivityLog> findByUser_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("""
            SELECT a FROM ActivityLog a
            LEFT JOIN a.user u
            WHERE (:search IS NULL OR :search = ''
                OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.userName) LIKE LOWER(CONCAT('%', :search, '%')))
            ORDER BY a.createdAt DESC
            """)
    Page<ActivityLog> findAllForAdmin(@Param("search") String search, Pageable pageable);

    @Modifying

    @Query("DELETE FROM ActivityLog a WHERE a.createdAt < :before")
    int deleteByCreatedAtBefore(@Param("before")LocalDateTime before);

    // internal - count log by project
    long countByProject_ProjectId(Long projectId);

    // Internal - count long by user
    long countByUser_UserId(Long userId);

}
