package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.label.TaskLabelRequest;
import com.MMM.taskmanager.dto.response.label.TaskLabelResponse;
import com.MMM.taskmanager.entity.Label;
import com.MMM.taskmanager.entity.Task;
import com.MMM.taskmanager.entity.TaskLabel;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.TaskLabelMapper;
import com.MMM.taskmanager.repository.LabelRepository;
import com.MMM.taskmanager.repository.TaskLabelRepository;
import com.MMM.taskmanager.repository.TaskRepository;
import com.MMM.taskmanager.service.TaskLabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TaskLabelServiceImpl implements TaskLabelService {

    private final TaskLabelRepository taskLabelRepository;
    private final TaskRepository taskRepository;
    private final LabelRepository labelRepository;
    private final TaskLabelMapper taskLabelMapper;

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public TaskLabelResponse attachLabelToTask(Long taskId, TaskLabelRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        Label label = labelRepository.findById(request.getLabelId())
                .orElseThrow(() -> new AppException(ErrorCode.LABEL_NOT_FOUND));

        boolean alreadyAttached = taskLabelRepository.existsByTaskIdAndLabelId(taskId, request.getLabelId());
        if (alreadyAttached) {
            throw new AppException(ErrorCode.TASK_LABEL_ALREADY_EXISTS);
        }

        // Kiểm tra label có thuộc cùng project với task không
        boolean belongsToProject = labelRepository.existsByLabelIdAndProjectId(
                request.getLabelId(), task.getProject().getProjectId()
        );
        if (!belongsToProject) {
            throw new AppException(ErrorCode.LABEL_ACCESS_DENIED);
        }

        TaskLabel taskLabel = TaskLabel.builder()
                .task(task)
                .label(label)
                .build();

        TaskLabel saved = taskLabelRepository.save(taskLabel);
        return taskLabelMapper.toResponse(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "task", key = "#taskId"),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public void detachLabelFromTask(Long taskId, Long labelId) {
        boolean exists = taskLabelRepository.existsByTaskIdAndLabelId(taskId, labelId);
        if (!exists) {
            throw new AppException(ErrorCode.TASK_LABEL_NOT_FOUND);
        }
        taskLabelRepository.deleteByTaskIdAndLabelId(taskId, labelId);
    }
}