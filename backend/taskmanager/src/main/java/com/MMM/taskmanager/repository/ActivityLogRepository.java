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

    // log by project
    Page<ActivityLog> findByProject_ProjectIdOrderByCreatedAtDesc(Long projectId, Pageable pageable);

    // log by user
    Page<ActivityLog> findByUser_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Modifying

    @Query("DELETE FROM ActivityLog a WHERE a.createdAt < :before")
    int deleteByCreatedAtBefore(@Param("before")LocalDateTime before);

    // internal - count log by project
    long countByProject_ProjectId(Long projectId);

    // Internal - count long by user
    long countByUser_UserId(Long userId);

}
