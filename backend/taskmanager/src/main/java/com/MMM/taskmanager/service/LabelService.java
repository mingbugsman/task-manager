package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.label.LabelCreateRequest;
import com.MMM.taskmanager.dto.request.label.LabelUpdateRequest;
import com.MMM.taskmanager.dto.response.label.LabelResponse;
import com.MMM.taskmanager.dto.response.task.LabelSummaryResponse;

import java.util.List;

public interface LabelService {

    List<LabelResponse> getLabelsByProject(Long projectId);

    LabelSummaryResponse createLabel(Long projectId, LabelCreateRequest request);

    LabelSummaryResponse updateLabel(Long labelId, LabelUpdateRequest request);

    void deleteLabel(Long labelId);
}