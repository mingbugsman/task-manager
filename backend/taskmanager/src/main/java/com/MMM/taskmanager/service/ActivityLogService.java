package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.activity_log.ActivityLogRequest;
import com.MMM.taskmanager.dto.response.activity_log.ActivityLogResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;

import java.time.LocalDateTime;

public interface ActivityLogService {

    PageResponse<ActivityLogResponse> getActivities(String entityType, Long entityId, int page, int size);
    ActivityLogResponse getActivityDetail(Long activityLogId);
    PageResponse<ActivityLogResponse> getActivitiesByProject(Long projectId, int page, int size);
    PageResponse<ActivityLogResponse> getActivitiesByUser(Long userId, int page, int size);
    PageResponse<ActivityLogResponse> getMyActivities(int page, int size);
    void createActivityLog(ActivityLogRequest request);
    int deleteOldActivity(LocalDateTime before);
}
