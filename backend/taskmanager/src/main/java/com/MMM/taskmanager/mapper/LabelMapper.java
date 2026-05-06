package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.task.LabelSummaryResponse;
import com.MMM.taskmanager.entity.Label;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.Set;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LabelMapper {

    LabelSummaryResponse toLabelSummary(Label label);

    Set<LabelSummaryResponse> toLabelSummarySet(Set<Label> labels);
}