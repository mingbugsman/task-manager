package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.AdminNotificationResponse;
import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Notification;

public interface NotificationService {
    PageResponse<NotificationResponse> getNotifications(Boolean isRead, int page, int size);
    long getUnreadCount();

    NotificationResponse maskAsRead(Long notificationId);
    void markAllAsRead();

    void deleteNotification(Long notificationId);

    void createSystemNotification(SystemNotificationRequest request);

    PageResponse<AdminNotificationResponse> getAllNotificationsForAdmin(
            String search, String type, int page, int size);

    void deleteNotificationAsAdmin(Long notificationId);

    void createNotification(Long userId, String title, String message, String type, String entityType, Long entityId);

}
