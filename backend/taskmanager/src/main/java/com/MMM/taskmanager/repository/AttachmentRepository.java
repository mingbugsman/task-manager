package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Attachment;
import com.MMM.taskmanager.entity.type.AttachmentEntityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    List<Attachment> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
            String entityType, Long entityId);

    Optional<Attachment> findByAttachmentIdAndUser_UserId(
            Long attachmentId, Long userId);


    Optional<Attachment> findByAttachmentId(Long attachmentId);

    // Delete all attachment by entity — use when delete Task/Project/Comment
    @Modifying
    @Query("DELETE FROM Attachment a WHERE a.entityType = :entityType AND a.entityId = :entityId")
    void deleteAllByEntityTypeAndEntityId(
            @Param("entityType") AttachmentEntityType entityType,
            @Param("entityId") Long entityId);

    long countByEntityTypeAndEntityId(String entityType, Long entityId);
}
