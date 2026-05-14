package com.MMM.taskmanager.repository;


import com.MMM.taskmanager.entity.ProjectMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    int countByProject_ProjectId(Long projectId);

    @Query("""
            SELECT u.avatarUrl FROM ProjectMember pm
            JOIN pm.user u
            WHERE pm.project.projectId = :projectId
            ORDER BY pm.joinedAt ASC
            LIMIT 3
            """)
    List<String> findTop3AvatarUrlsByProjectId(@Param("projectId") Long projectId);


    // 1. Native JPA

    /**
     * Kiểm tra user đã là member của project chưa.
     * Dùng để validate trước khi mời (tránh duplicate).
     */
    boolean existsByProject_ProjectIdAndUser_UserId(Long projectId, Long userId);

    /**
     * Kiểm tra user có role cụ thể trong project không.
     * Dùng xuyên suốt các module để validate quyền.
     */
    boolean existsByProject_ProjectIdAndUser_UserIdAndRole(
            Long projectId, Long userId, String role
    );

    /**
     * Đếm số ADMIN trong project.
     * Dùng khi ADMIN muốn leave - phải còn ít nhất 1 ADMIN khác.
     */
    long countByProject_ProjectIdAndRole(Long projectId, String role);

    /**
     * Đếm tổng member trong project theo từng role.
     * Dùng cho MemberStatisticResponseDTO.
     */
    long countByProject_ProjectIdAndRoleAndUser_UserIdNot(
            Long projectId, String role, Long excludeUserId
    );

    /**
     * Xóa member khỏi project theo projectId và userId.
     * Dùng cho kick member và leave project.
     */
    void deleteByProject_ProjectIdAndUser_UserId(Long projectId, Long userId);


    // 2. Query by jpa

    /**
     * GET /api/v1/projects/{project_id}/members?role=...
     * Lấy danh sách member trong project, filter role tùy chọn, có phân trang.
     */
    @Query(
            value = """
                    SELECT pm FROM ProjectMember pm
                    JOIN FETCH pm.user u
                    WHERE pm.project.projectId = :projectId
                    AND (:role IS NULL OR pm.role = :role)
                    ORDER BY pm.joinedAt ASC
                    """,
            countQuery = """
                    SELECT COUNT(pm) FROM ProjectMember pm
                    WHERE pm.project.projectId = :projectId
                    AND (:role IS NULL OR pm.role = :role)
                    """
    )
    Page<ProjectMember> findMembersByProjectId(
            @Param("projectId") Long projectId,
            @Param("role") String role,
            Pageable pageable
    );

    /**
     * Tìm ProjectMember theo projectId và userId.
     * Dùng trong: getById, updateRole, kick, leave.
     */
    @Query("""
            SELECT pm FROM ProjectMember pm
            JOIN FETCH pm.user u
            WHERE pm.project.projectId = :projectId
            AND pm.user.userId = :userId
            """)
    Optional<ProjectMember> findByProjectIdAndUserId(
            @Param("projectId") Long projectId,
            @Param("userId") Long userId
    );

    /**
     * Đếm tổng member theo từng role trong project.
     * Dùng để build MemberStatisticResponse.
     *
     * Lý do dùng @Query:
     * - GROUP BY không được hỗ trợ bởi JPA thuần derived query
     */
    @Query("""
            SELECT pm.role, COUNT(pm)
            FROM ProjectMember pm
            WHERE pm.project.projectId = :projectId
            GROUP BY pm.role
            """)
    java.util.List<Object[]> countMembersByRoleGrouped(@Param("projectId") Long projectId);
}