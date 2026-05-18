package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.label.TaskLabelResponse;
import com.MMM.taskmanager.entity.TaskLabel;

public interface TaskLabelMapper {

    TaskLabelResponse toResponse(TaskLabel taskLabel);
}
