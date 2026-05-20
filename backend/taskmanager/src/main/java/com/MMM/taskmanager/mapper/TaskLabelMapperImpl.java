package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.label.TaskLabelResponse;
import com.MMM.taskmanager.entity.Label;
import com.MMM.taskmanager.entity.Task;
import com.MMM.taskmanager.entity.TaskLabel;
import org.springframework.stereotype.Component;

@Component
public class TaskLabelMapperImpl implements TaskLabelMapper {

    @Override
    public TaskLabelResponse toResponse(TaskLabel taskLabel) {
        if (taskLabel == null) {
            return null;
        }

        Task task = taskLabel.getTask();
        Label label = taskLabel.getLabel();

        return TaskLabelResponse.builder()
                .taskId(task != null ? task.getTaskId() : null)
                .labelId(label != null ? label.getLabelId() : null)
                .labelName(label != null ? label.getLabelName() : null)
                .colorCode(label != null ? label.getColorCode() : null)
                .assignedAt(taskLabel.getAssignedAt())
                .build();
    }
}
