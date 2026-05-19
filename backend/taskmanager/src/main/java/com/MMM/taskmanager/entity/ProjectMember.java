package com.MMM.taskmanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "project_members",
        uniqueConstraints = @UniqueConstraint(name = "uk_project_user", columnNames = {"project_id", "user_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectMember implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_member_id")
    private Long projectMemberId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, foreignKey = @ForeignKey(name = "fk_pm_project"))
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_pm_user"))
    private User user;

    @Column(name = "role", length = 50)
    @Builder.Default
    private String role = "Member";

    @Column(name = "joined_at", updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
    }

    /** Chủ dự án (Owner) — tương thích bản cũ lưu "Admin". */
    public boolean isOwner() {
        return "Owner".equalsIgnoreCase(role) || "Admin".equalsIgnoreCase(role);
    }

    /** @deprecated dùng {@link #isOwner()} */
    public boolean isAdmin() {
        return isOwner();
    }

    public boolean isLead() {
        return "Lead".equalsIgnoreCase(role);
    }

    /** OWNER hoặc LEAD */
    public boolean isManager() {
        return isOwner() || isLead();
    }
}