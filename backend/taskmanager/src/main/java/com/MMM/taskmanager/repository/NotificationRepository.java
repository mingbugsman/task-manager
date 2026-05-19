package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUser_UserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<Notification> findByUser_UserIdAndIsReadOrderByCreatedAtDesc(Long userId, Boolean isRead, Pageable pageable);

    // for /unread-count
    long countByUser_UserIdAndIsReadFalse(Long userId);

    // for PATCH /read-all
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = True WHERE n.user.userId = :userId AND n.isRead = False")
    int markAllAsReadByUserId(@Param("userId") Long userId);

    Optional<Notification> findByNotificationIdAndUser_UserId(Long notificationId, Long userId);

    @Query("""
            SELECT n FROM Notification n
            JOIN n.user u
            WHERE (:search IS NULL OR :search = ''
                OR LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(n.message) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.userName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:type IS NULL OR :type = '' OR n.type = :type)
            ORDER BY n.createdAt DESC
            """)
    Page<Notification> findAllForAdmin(
            @Param("search") String search,
            @Param("type") String type,
            Pageable pageable);

    Optional<Notification> findByNotificationId(Long notificationId);
}
