package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.Label;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {

    // Lấy toàn bộ label của 1 project
    @Query("""
            SELECT l FROM Label l
            WHERE l.project.projectId = :projectId
            ORDER BY l.labelName ASC
            """)
    List<Label> findAllByProjectId(@Param("projectId") Long projectId);

    // Kiểm tra label có thuộc project không
    @Query("""
            SELECT COUNT(l) > 0 FROM Label l
            WHERE l.labelId = :labelId
              AND l.project.projectId = :projectId
            """)
    boolean existsByLabelIdAndProjectId(@Param("labelId") Long labelId, @Param("projectId") Long projectId);

    // Kiểm tra tên label đã tồn tại trong project chưa (dùng khi create/update)
    @Query("""
            SELECT COUNT(l) > 0 FROM Label l
            WHERE LOWER(l.labelName) = LOWER(:labelName)
              AND l.project.projectId = :projectId
              AND (:excludeId IS NULL OR l.labelId != :excludeId)
            """)
    boolean existsByLabelNameInProject(
            @Param("labelName") String labelName,
            @Param("projectId") Long projectId,
            @Param("excludeId") Long excludeId
    );
}