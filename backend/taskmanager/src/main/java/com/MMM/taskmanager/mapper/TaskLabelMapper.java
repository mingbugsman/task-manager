package com.MMM.taskmanager.mapper;


import com.MMM.taskmanager.dto.response.label.TaskLabelResponse;
import com.MMM.taskmanager.entity.TaskLabel;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "Spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface TaskLabelMapper {

    @Mapping(target = "taskId", source = "task.taskId")
    @Mapping(target = "labelId", source = "label.labelId")
    @Mapping(target = "labelName", source = "label.labelName")
    @Mapping(target = "colorCode", source = "label.colorCode")
    TaskLabelResponse toResponse(TaskLabel taskLabel);

}
