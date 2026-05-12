package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Task;
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
public interface TaskRepository extends JpaRepository<Task, Long> {

    int countByAssignee_UserIdAndDeletedAtIsNull(Long userId);
    int countByAssignee_UserIdAndStatusAndDeleteAtIsNull(Long userId, String status);


    @Query("""
            SELECT DISTINCT t FROM Task t
            LEFT JOIN FETCH t.assignee
            LEFT JOIN FETCH t.labels
            WHERE t.project.projectId = :projectId
            AND t.status = :status
            AND t.deletedAt IS NULL
            AND (:assigneeId IS NULL OR t.assignee.userId = :assigneeId)
            AND (:labelId IS NULL OR EXISTS (
                SELECT l FROM t.labels l WHERE l.labelId = :labelId
            ))
            ORDER BY t.createdAt DESC
            """)
    List<Task> findBoardTasks(
            @Param("projectId") Long projectId,
            @Param("status") String status,
            @Param("assigneeId") Long assigneeId,
            @Param("labelId") Long labelId);

    // Kanban: lấy task theo project, lọc status, tìm kiếm tên, chưa bị xóa
    @Query("""
            SELECT t FROM Task t
            LEFT JOIN FETCH t.assignee
            LEFT JOIN FETCH t.labels
            WHERE t.project.projectId = :projectId
              AND t.deletedAt IS NULL
              AND (:status IS NULL OR LOWER(t.status) = LOWER(:status))
              AND (:search IS NULL OR LOWER(t.taskName) LIKE LOWER(CONCAT('%', :search, '%')))
            """)
    Page<Task> findByProjectIdAndFilters(
            @Param("projectId") Long projectId,
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable
    );

    // Chi tiết task chưa bị xóa
    @Query("""
            SELECT t FROM Task t
            LEFT JOIN FETCH t.project
            LEFT JOIN FETCH t.assignee
            LEFT JOIN FETCH t.reporter
            LEFT JOIN FETCH t.updatedBy
            LEFT JOIN FETCH t.labels
            WHERE t.taskId = :taskId
              AND t.deletedAt IS NULL
            """)
    Optional<Task> findDetailById(@Param("taskId") Long taskId);

    // My tasks: task được giao cho user trên toàn hệ thống
    @Query("""
            SELECT t FROM Task t
            LEFT JOIN FETCH t.project
            LEFT JOIN FETCH t.labels
            WHERE t.assignee.userId = :userId
              AND t.deletedAt IS NULL
            ORDER BY t.createdAt DESC
            """)
    List<Task> findMyTasks(@Param("userId") Long userId);

    // Statistic theo project
    @Query("""
            SELECT COUNT(t) FROM Task t
            WHERE t.project.projectId = :projectId AND t.deletedAt IS NULL
            """)
    int countTotalByProject(@Param("projectId") Long projectId);

    @Query("""
            SELECT COUNT(t) FROM Task t
            WHERE t.project.projectId = :projectId
              AND LOWER(t.status) = LOWER(:status)
              AND t.deletedAt IS NULL
            """)
    int countByProjectAndStatus(@Param("projectId") Long projectId, @Param("status") String status);

    @Query("""
            SELECT COUNT(t) FROM Task t
            WHERE t.project.projectId = :projectId
              AND t.dueAt < :now
              AND LOWER(t.status) != 'done'
              AND t.deletedAt IS NULL
            """)
    long countOverdueByProject(@Param("projectId") Long projectId, @Param("now") LocalDateTime now);

    // Soft delete toàn bộ task theo project
    @Modifying
    @Query("""
            UPDATE Task t SET t.deletedAt = :now
            WHERE t.project.projectId = :projectId AND t.deletedAt IS NULL
            """)
    void softDeleteByProjectId(@Param("projectId") Long projectId, @Param("now") LocalDateTime now);
}