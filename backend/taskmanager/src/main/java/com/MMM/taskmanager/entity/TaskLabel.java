package com.MMM.taskmanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;


@Entity
@Table(name = "task_labels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(TaskLabelId.class)
public class TaskLabel implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_tl_task"))
    private Task task;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "label_id", foreignKey = @ForeignKey(name = "fk_tl_label"))
    private Label label;

    @Column(name = "assigned_at", updatable = false)
    private LocalDateTime assignedAt;

    @PrePersist
    protected void onCreate() {
        assignedAt = LocalDateTime.now();
    }
}