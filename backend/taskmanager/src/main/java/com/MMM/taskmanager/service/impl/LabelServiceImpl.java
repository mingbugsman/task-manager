package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.label.LabelCreateRequest;
import com.MMM.taskmanager.dto.request.label.LabelUpdateRequest;
import com.MMM.taskmanager.dto.response.label.LabelResponse;
import com.MMM.taskmanager.dto.response.task.LabelSummaryResponse;
import com.MMM.taskmanager.entity.Label;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.LabelMapper;
import com.MMM.taskmanager.repository.LabelRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.service.LabelService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LabelServiceImpl implements LabelService {

    private final LabelRepository labelRepository;
    private final ProjectRepository projectRepository;
    private final LabelMapper labelMapper;

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "labels", key = "'project:' + #projectId")
    public List<LabelResponse> getLabelsByProject(Long projectId) {
        List<Label> labels = labelRepository.findAllByProjectId(projectId);
        return labelMapper.toResponseList(labels);
    }

    @Override
    @CacheEvict(value = "labels", key = "'project:' + #projectId")
    public LabelSummaryResponse createLabel(Long projectId, LabelCreateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorCode.LABEL_NOT_FOUND));

        boolean isDuplicate = labelRepository.existsByLabelNameInProject(
                request.getLabelName(), projectId, null
        );
        if (isDuplicate) {
            throw new AppException(ErrorCode.LABEL_ALREADY_EXISTS);
        }

        Label label = Label.builder()
                .project(project)
                .labelName(request.getLabelName())
                .labelDescription(request.getLabelDescription())
                .colorCode(request.getColorCode() != null ? request.getColorCode() : "#808080")
                .build();

        Label saved = labelRepository.save(label);
        return labelMapper.toLabelSummary(saved);
    }


    @Override
    @Caching(evict = {
            @CacheEvict(value = "label", key = "#labelId"),
            @CacheEvict(value = "labels", allEntries = true)
    })
    public LabelSummaryResponse updateLabel(Long labelId, LabelUpdateRequest request) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new AppException(ErrorCode.LABEL_NOT_FOUND));

        boolean isDuplicate = labelRepository.existsByLabelNameInProject(
                request.getLabelName(), label.getProject().getProjectId(), labelId
        );
        if (isDuplicate) {
            throw new AppException(ErrorCode.LABEL_ALREADY_EXISTS);
        }

        System.out.println("COLOR: "+ request.getColorCode());
        label.setLabelName(request.getLabelName());
        label.setLabelDescription(request.getLabelDescription());
        if (request.getColorCode() != null) {
            label.setColorCode(request.getColorCode());
        }

        Label saved = labelRepository.save(label);
        return labelMapper.toLabelSummary(saved);
    }

    @Override
    @Caching(evict = {
            @CacheEvict(value = "label", key = "#labelId"),
            @CacheEvict(value = "labels", allEntries = true),
            @CacheEvict(value = "tasks", allEntries = true)
    })
    public void deleteLabel(Long labelId) {
        Label label = labelRepository.findById(labelId)
                .orElseThrow(() -> new AppException(ErrorCode.LABEL_NOT_FOUND));
        labelRepository.delete(label);
    }
}