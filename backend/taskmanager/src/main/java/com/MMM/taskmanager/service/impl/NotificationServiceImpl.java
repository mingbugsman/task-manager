package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Notification;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.NotificationMapper;
import com.MMM.taskmanager.repository.NotificationRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.NotificationService;
import com.MMM.taskmanager.util.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor

public class NotificationServiceImpl implements NotificationService {
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    private static final String CACHE_UNREAD_COUNT = "notification:unread_count:";

    @Override
    public PageResponse<NotificationResponse> getNotifications(Boolean isRead, int page, int size) {
        Long userId = getCurrentUserId();

        Pageable pageable = PageRequest.of(page, size);

        Page<Notification> notificationPage;

        if (isRead == null) {
            notificationPage = notificationRepository
                    .findByUser_UserIdOrderByCreatedAtDesc(userId, pageable);
        } else {
            notificationPage = notificationRepository
                    .findByUser_UserIdAndIsReadOrderByCreatedAtDesc(userId, isRead, pageable);
        }

        List<NotificationResponse> items = notificationMapper
                .toResponseList(notificationPage.getContent());

        return PageResponse.<NotificationResponse>builder()
                .currentPage(page)
                .pageSize(size)
                .totalPages(notificationPage.getTotalPages())
                .totalElements(notificationPage.getTotalElements())
                .hasNext(notificationPage.hasNext())
                .hasPrevious(notificationPage.hasPrevious())
                .items(items)
                .build();
    }

    @Override
    @Cacheable(value = CACHE_UNREAD_COUNT, key = "#root.target.getCurrentUserId()")
    public long getUnreadCount() {
        Long userId = getCurrentUserId();
        return notificationRepository.countByUser_UserIdAndIsReadFalse(userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = CACHE_UNREAD_COUNT, key = "#root.target.getCurrentUserId()")
    public NotificationResponse maskAsRead(Long notificationId) {
        Long userId = getCurrentUserId();
        Notification foundNotification = notificationRepository.findByNotificationIdAndUser_UserId(notificationId, userId).orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        if (Boolean.TRUE.equals(foundNotification.getIsRead())) {
            return notificationMapper.toResponse(foundNotification);
        }

        foundNotification.setIsRead(true);
        return notificationMapper.toResponse(foundNotification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Long userId = getCurrentUserId();
        int updated = notificationRepository.markAllAsReadByUserId(userId);
        log.info("Marked {} notifications as read for userId {}", updated, userId);
    }

    @Override
    @Transactional
    @CacheEvict(value = CACHE_UNREAD_COUNT, key = "#root.target.getCurrentUserId()")
    public void deleteNotification(Long notificationId) {
        Long userId = getCurrentUserId();
        Notification foundNotification = notificationRepository.findByNotificationIdAndUser_UserId(notificationId, userId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notificationRepository.delete(foundNotification);
    }

    @Override
    public void createSystemNotification(SystemNotificationRequest request) {

    }

    @Override
    public void createNotification(Long userId, String title, String message, String type, String entityType, Long entityId) {

    }

    public Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}
