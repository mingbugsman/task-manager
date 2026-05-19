package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.ProjectInviteLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ProjectInviteLinkRepository extends JpaRepository<ProjectInviteLink, Long> {

    Optional<ProjectInviteLink> findByToken(String token);

    @Query("""
            SELECT l FROM ProjectInviteLink l
            JOIN FETCH l.project p
            JOIN FETCH l.createdBy u
            WHERE l.token = :token
            """)
    Optional<ProjectInviteLink> findByTokenWithDetails(@Param("token") String token);
}
