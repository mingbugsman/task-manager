package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.label.TaskLabelRequest;
import com.MMM.taskmanager.dto.response.label.TaskLabelResponse;

public interface TaskLabelService {

    TaskLabelResponse attachLabelToTask(Long taskId, TaskLabelRequest request);

    void detachLabelFromTask(Long taskId, Long labelId);
}