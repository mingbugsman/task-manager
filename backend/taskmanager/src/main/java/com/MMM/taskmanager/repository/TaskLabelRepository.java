package com.MMM.taskmanager.repository;

import com.MMM.taskmanager.entity.TaskLabel;
import com.MMM.taskmanager.entity.TaskLabelId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLabelRepository extends JpaRepository<TaskLabel, TaskLabelId> {

    // Lấy toàn bộ label của 1 task
    @Query("""
            SELECT tl FROM TaskLabel tl
            JOIN FETCH tl.label
            WHERE tl.task.taskId = :taskId
            ORDER BY tl.assignedAt ASC
            """)
    List<TaskLabel> findAllByTaskId(@Param("taskId") Long taskId);

    // Kiểm tra label đã được gắn vào task chưa
    @Query("""
            SELECT COUNT(tl) > 0 FROM TaskLabel tl
            WHERE tl.task.taskId = :taskId
              AND tl.label.labelId = :labelId
            """)
    boolean existsByTaskIdAndLabelId(@Param("taskId") Long taskId, @Param("labelId") Long labelId);

    // Xóa 1 record trong bảng trung gian
    @Modifying
    @Query("""
            DELETE FROM TaskLabel tl
            WHERE tl.task.taskId = :taskId
              AND tl.label.labelId = :labelId
            """)
    void deleteByTaskIdAndLabelId(@Param("taskId") Long taskId, @Param("labelId") Long labelId);

    // Xóa toàn bộ task_label khi xóa label (cascade fallback)
    @Modifying
    @Query("""
            DELETE FROM TaskLabel tl
            WHERE tl.label.labelId = :labelId
            """)
    void deleteAllByLabelId(@Param("labelId") Long labelId);
}