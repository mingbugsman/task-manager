package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.task.LabelSummaryResponse;
import com.MMM.taskmanager.dto.response.task.TaskDetailResponse;
import com.MMM.taskmanager.dto.response.task.TaskSummaryResponse;
import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import com.MMM.taskmanager.entity.Label;
import com.MMM.taskmanager.entity.Task;
import com.MMM.taskmanager.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TaskMapper {

    @Mapping(target = "projectId", source = "project.projectId")
    @Mapping(target = "projectName", source = "project.projectName")
    @Mapping(target = "assignee", source = "assignee")
    @Mapping(target = "reporter", source = "reporter")
    @Mapping(target = "updatedBy", source = "updatedBy")
    TaskDetailResponse toDetailResponse(Task task);

    @Mapping(target = "assignee", source = "assignee")
    TaskSummaryResponse toSummaryResponse(Task task);

    List<TaskSummaryResponse> toSummaryResponseList(List<Task> tasks);

}