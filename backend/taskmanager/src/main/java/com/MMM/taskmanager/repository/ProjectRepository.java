package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    // get api/v1/projects
    @Query("""
            SELECT p FROM Project p
            JOIN ProjectMember pm ON pm.project.projectId = p.projectId
            WHERE pm.user.userId = :userId
            AND p.deletedAt IS NULL
            AND (:search IS NULL OR LOWER(p.projectName) LIKE LOWER(CONCAT('%', :search, '%')))
                        ORDER BY p.updatedAt DESC
           """)
    Page<Project> findActiveProjectsByUserId(@Param("userId") Long userId,
                                             @Param("search") String search,
                                             Pageable pageable);

    // get /api/v1/projects/{projectId}
    Optional<Project> findByProjectIdAndDeletedAtIsNull(Long projectId);


    // get /api/v1/projects/{projectId}
    // check if user is member of project
    @Query("""
            SELECT COUNT(pm) > 0 FROM ProjectMember pm
            WHERE pm.project.projectId = :projectId
            AND pm.user.userId = :userId
            AND pm.project.deletedAt IS NULL
            """)
    boolean existsByProjectIdAndUserId(
            @Param("projectId") Long projectId,
            @Param("userId") Long userId);

    // patch /api/v1/projects/{project_id}/restore
    Optional<Project> findByProjectIdAndDeletedAtIsNotNull(Long projectId);

    // internal - checking if project is existed and not deleted
    boolean existsByProjectIdAndDeletedAtIsNull(Long projectId);

    // internal - retrieve all user projects even if it is deleted or not
    @Query("""
            SELECT p FROM Project p
            JOIN ProjectMember pm ON pm.project.projectId = p.projectId
            WHERE pm.user.userId = :userId
            ORDER BY p.updatedAt DESC
            """)
    Page<Project> findAllProjectsByUserId(
            @Param("userId") Long userId,
            Pageable pageable
    );
}
