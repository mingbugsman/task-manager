package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.activity_log.ActivityLogResponse;
import com.MMM.taskmanager.entity.ActivityLog;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ActivityLogMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "userName", source = "user.userName")
    @Mapping(target = "avatarUrl", source = "user.avatarUrl")
    @Mapping(target = "projectId", source = "project.projectId")
    ActivityLogResponse toResponse(ActivityLog activityLog);

    List<ActivityLogResponse> toResponseList(List<ActivityLog> activityLogs);
}
