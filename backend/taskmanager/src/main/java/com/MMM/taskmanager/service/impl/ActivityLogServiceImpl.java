package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.activity_log.ActivityLogRequest;
import com.MMM.taskmanager.dto.response.activity_log.ActivityLogResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.ActivityLog;
import com.MMM.taskmanager.entity.Project;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.ActivityLogMapper;
import com.MMM.taskmanager.repository.ActivityLogRepository;
import com.MMM.taskmanager.repository.ProjectRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.ActivityLogService;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ActivityLogServiceImpl implements ActivityLogService {
    ProjectRepository projectRepository;
    ActivityLogMapper activityLogMapper;
    ActivityLogRepository activityLogRepository;
    private final UserRepository userRepository;

    @Override
    public PageResponse<ActivityLogResponse> getActivities(String entityType, Long entityId, int page, int size) {
        ActivityLogEntityType type = ActivityLogEntityType.fromString(entityType);
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logPage = activityLogRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(type, entityId, pageable);
        return buildPageResponse(logPage, page, size);
    }

    @Override
    public ActivityLogResponse getActivityDetail(Long activityLogId) {
        ActivityLog activityLog = activityLogRepository.findByActivityLogId(activityLogId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_LOG_NOT_FOUND));

        return activityLogMapper.toResponse(activityLog);
    }

    // api tạm thời, sẽ sửa lại sau vì chưa có module project, project - member...
    @Override
    public PageResponse<ActivityLogResponse> getActivitiesByProject(Long projectId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<ActivityLog> logPage = activityLogRepository
                .findByProject_ProjectIdOrderByCreatedAtDesc(projectId, pageable);

        return buildPageResponse(logPage, page, size);
    }

    @Override
    public PageResponse<ActivityLogResponse> getActivitiesByUser(Long userId, int page, int size) {
        if (!userRepository.existsById(userId)) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }
        Pageable pageable = PageRequest.of(page, size);

        Page<ActivityLog> logPage = activityLogRepository.findByUser_UserIdOrderByCreatedAtDesc(userId, pageable);
        return buildPageResponse(logPage, page, size);
    }

    @Override
    public PageResponse<ActivityLogResponse> getMyActivities(int page, int size) {
        Long userId= SecurityUtils.getCurrentUserId();
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logPage = activityLogRepository.findByUser_UserIdOrderByCreatedAtDesc(userId, pageable);
        return buildPageResponse(logPage, page, size);
    }

    @Override
    public void createActivityLog(ActivityLogRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Project project = null;

        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new AppException(ErrorCode.PROJECT_NOT_FOUND));
        }

        ActivityLog activityLog = ActivityLog.builder()
                .user(user)
                .action(request.getAction())
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .metadata(request.getMetadata())
                .project(project)
                .ipAddress(request.getIpAddress())
                .build();
        activityLogRepository.save(activityLog);
        log.info("created activity log action={}, entityType={}, entityId={} by userId: {}",
                request.getAction(), request.getEntityType(), request.getEntityId(), userId);
    }


    @Override
    @Transactional
    public int deleteOldActivity(LocalDateTime before) {
        int deleted = activityLogRepository.deleteByCreatedAtBefore(before);
        log.info("Deleted {} activity logs before={}", deleted, before);
        return deleted;
    }

    private PageResponse<ActivityLogResponse> buildPageResponse(
            Page<ActivityLog> logPage, int page, int size
    ) {
        List<ActivityLogResponse> items = activityLogMapper.toResponseList(logPage.getContent());
        return PageResponse.<ActivityLogResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(logPage.getTotalPages())
                .totalElements(logPage.getTotalElements())
                .hasNext(logPage.hasNext())
                .hasPrevious(logPage.hasPrevious())
                .items(items)
                .build();
    }
}
