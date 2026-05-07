package com.MMM.taskmanager.entity;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;

@Entity
@Table(name = "labels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Label implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "label_id")
    private Long labelId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, foreignKey = @ForeignKey(name = "fk_labels_project"))
    private Project project;

    @Column(name = "label_name", nullable = false, length = 50)
    private String labelName;

    @Column(name = "label_description", columnDefinition = "TEXT")
    private String labelDescription;

    @Column(name = "color_code", length = 7)
    @Builder.Default
    private String colorCode = "#808080";
}