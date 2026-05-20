package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.config.SseEmitterManager;
import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.AdminNotificationResponse;
import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Notification;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.NotificationMapper;
import com.MMM.taskmanager.repository.NotificationRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.NotificationService;
import com.MMM.taskmanager.util.SecurityUtils;

import lombok.RequiredArgsConstructor;

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
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;
    private final SseEmitterManager sseEmitterManager;

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
        notificationRepository.save(foundNotification);
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
    @Transactional
    public void createSystemNotification(SystemNotificationRequest request) {
        List<User> targetUsers;

        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            targetUsers = userRepository.findAll();
        } else {
            targetUsers = userRepository.findAllById(request.getUserIds());
        }
        List<Notification> notifications = targetUsers.stream()
                .map(user -> Notification.builder()
                        .user(user)
                        .title(request.getTitle())
                        .message(request.getMessage())
                        .type("SYSTEM")
                        .isRead(false)
                        .build())
                .toList();

        notificationRepository.saveAll(notifications);
        NotificationResponse response = notificationMapper.toResponse(notifications.get(0));
        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            sseEmitterManager.broadcastToAll(response);
        } else {
            notifications.forEach(notification -> {
                // Push SSE realtime for user if it online and push to email
                sseEmitterManager.sendToUser(notification.getUser().getUserId(), response);
            });
        }

        log.info("Created {} system notifications", notifications.size());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminNotificationResponse> getAllNotificationsForAdmin(
            String search, String type, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        String q = search != null && !search.isBlank() ? search.trim() : null;
        String typeFilter = type != null && !type.isBlank() ? type.trim() : null;
        Page<Notification> notificationPage =
                notificationRepository.findAllForAdmin(q, typeFilter, pageable);

        List<AdminNotificationResponse> items = notificationPage.getContent().stream()
                .map(n -> AdminNotificationResponse.builder()
                        .notificationId(n.getNotificationId())
                        .recipientUserId(n.getUser().getUserId())
                        .recipientUserName(n.getUser().getUserName())
                        .recipientEmail(n.getUser().getEmail())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .type(n.getType())
                        .isRead(n.getIsRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .toList();

        return PageResponse.<AdminNotificationResponse>builder()
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
    @Transactional
    public void deleteNotificationAsAdmin(Long notificationId) {
        Notification found = notificationRepository.findByNotificationId(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notificationRepository.delete(found);
    }

    @Override
    @Transactional
    @CacheEvict(value = CACHE_UNREAD_COUNT, key = "#userId")
    public void createNotification(Long userId, String title, String message, String type, String entityType, Long entityId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .entityType(entityType)
                .entityId(entityId)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);

        // Push SSE realtime for user if it online and email if user config
        NotificationResponse response = notificationMapper.toResponse(saved);
        sseEmitterManager.sendToUser(userId, response);

        log.info("Created notification type={} for userId={}", type, userId);

    }

    public Long getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}
