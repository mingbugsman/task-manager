package com.MMM.taskmanager.entity;

import lombok.*;
import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class TaskLabelId implements Serializable {
    private Long task;
    private Long label;
}