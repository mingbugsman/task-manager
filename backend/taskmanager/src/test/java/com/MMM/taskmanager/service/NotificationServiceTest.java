package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.notification.SystemNotificationRequest;
import com.MMM.taskmanager.dto.response.notification.NotificationResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Notification;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.exception.ErrorCode.*;
import com.MMM.taskmanager.mapper.NotificationMapper;
import com.MMM.taskmanager.repository.NotificationRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.impl.NotificationServiceImpl;
import com.MMM.taskmanager.util.SecurityUtils;
import com.MMM.taskmanager.config.SseEmitterManager;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationMapper notificationMapper;

    @Mock
    private SseEmitterManager sseEmitterManager;

    @InjectMocks
    private NotificationServiceImpl notificationService;


    // Test data
    private User mockUser;
    private Notification mockNotification;
    private NotificationResponse mockNotificationResponse;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1L)
                .build();

        mockNotification = Notification.builder()
                .notificationId(1L)
                .user(mockUser)
                .title("Test Title")
                .message("Test Message")
                .type("TASK_ASSIGNED")
                .entityType("Task")
                .entityId(10L)
                .isRead(false)
                .build();

        mockNotificationResponse = NotificationResponse.builder()
                .notificationId(1L)
                .title("Test Title")
                .message("Test Message")
                .type("TASK_ASSIGNED")
                .entityType("Task")
                .entityId(10L)
                .isRead(false)
                .build();
    }


    // getNotifications
    @Nested
    @DisplayName("getNotifications()")
    class GetNotifications {

        @Test
        @DisplayName("Lấy tất cả notifications khi isRead = null")
        void getNotifications_whenIsReadNull_shouldReturnAllNotifications() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                Pageable pageable = PageRequest.of(0, 20);
                Page<Notification> page = new PageImpl<>(List.of(mockNotification), pageable, 1);

                when(notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(1L, pageable))
                        .thenReturn(page);
                when(notificationMapper.toResponseList(List.of(mockNotification)))
                        .thenReturn(List.of(mockNotificationResponse));

                // when
                PageResponse<NotificationResponse> result =
                        notificationService.getNotifications(null, 0, 20);

                // then
                assertThat(result).isNotNull();
                assertThat(result.getItems()).hasSize(1);
                assertThat(result.getTotalElements()).isEqualTo(1);
                assertThat(result.getCurrentPage()).isEqualTo(0);
                assertThat(result.isHasNext()).isFalse();

                verify(notificationRepository).findByUser_UserIdOrderByCreatedAtDesc(1L, pageable);
                verify(notificationRepository, never())
                        .findByUser_UserIdAndIsReadOrderByCreatedAtDesc(any(), any(), any());
            }
        }

        @Test
        @DisplayName("Lấy notifications chưa đọc khi isRead = false")
        void getNotifications_whenIsReadFalse_shouldReturnUnreadNotifications() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                Pageable pageable = PageRequest.of(0, 20);
                Page<Notification> page = new PageImpl<>(List.of(mockNotification), pageable, 1);

                when(notificationRepository
                        .findByUser_UserIdAndIsReadOrderByCreatedAtDesc(1L, false, pageable))
                        .thenReturn(page);
                when(notificationMapper.toResponseList(List.of(mockNotification)))
                        .thenReturn(List.of(mockNotificationResponse));

                // when
                PageResponse<NotificationResponse> result =
                        notificationService.getNotifications(false, 0, 20);

                // then
                assertThat(result.getItems()).hasSize(1);
                assertThat(result.getItems().get(0).getIsRead()).isFalse();

                verify(notificationRepository)
                        .findByUser_UserIdAndIsReadOrderByCreatedAtDesc(1L, false, pageable);
                verify(notificationRepository, never())
                        .findByUser_UserIdOrderByCreatedAtDesc(any(), any());
            }
        }

        @Test
        @DisplayName("Trả về danh sách rỗng khi không có notification")
        void getNotifications_whenEmpty_shouldReturnEmptyPage() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                Pageable pageable = PageRequest.of(0, 20);
                Page<Notification> emptyPage = new PageImpl<>(List.of(), pageable, 0);

                when(notificationRepository.findByUser_UserIdOrderByCreatedAtDesc(1L, pageable))
                        .thenReturn(emptyPage);
                when(notificationMapper.toResponseList(List.of())).thenReturn(List.of());

                // when
                PageResponse<NotificationResponse> result =
                        notificationService.getNotifications(null, 0, 20);

                // then
                assertThat(result.getItems()).isEmpty();
                assertThat(result.getTotalElements()).isEqualTo(0);
            }
        }
    }


    // getUnreadCount
    @Nested
    @DisplayName("getUnreadCount()")
    class GetUnreadCount {

        @Test
        @DisplayName("Trả về đúng số notification chưa đọc")
        void getUnreadCount_shouldReturnCorrectCount() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.countByUser_UserIdAndIsReadFalse(1L)).thenReturn(5L);

                // when
                long count = notificationService.getUnreadCount();

                // then
                assertThat(count).isEqualTo(5L);
                verify(notificationRepository).countByUser_UserIdAndIsReadFalse(1L);
            }
        }

        @Test
        @DisplayName("Trả về 0 khi không có notification chưa đọc")
        void getUnreadCount_whenNoUnread_shouldReturnZero() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.countByUser_UserIdAndIsReadFalse(1L)).thenReturn(0L);

                // when
                long count = notificationService.getUnreadCount();

                // then
                assertThat(count).isEqualTo(0L);
            }
        }
    }

    // markAsRead
    @Nested
    @DisplayName("markAsRead()")
    class MarkAsRead {

        @Test
        @DisplayName("Đánh dấu đã đọc thành công")
        void markAsRead_whenNotificationExists_shouldReturnUpdatedResponse() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                mockNotification.setIsRead(false);

                when(notificationRepository.findByNotificationIdAndUser_UserId(1L, 1L))
                        .thenReturn(Optional.of(mockNotification));

                Notification savedNotification = Notification.builder()
                        .notificationId(1L)
                        .user(mockUser)
                        .title("Test Title")
                        .message("Test Message")
                        .type("TASK_ASSIGNED")
                        .isRead(true)
                        .build();

                when(notificationRepository.save(mockNotification)).thenReturn(savedNotification);

                NotificationResponse readResponse = NotificationResponse.builder()
                        .notificationId(1L)
                        .isRead(true)
                        .build();
                when(notificationMapper.toResponse(any(Notification.class))).thenReturn(readResponse);

                // when
                NotificationResponse result = notificationService.maskAsRead(1L);

                // then
                assertThat(result.getIsRead()).isTrue();
                verify(notificationRepository).save(mockNotification);
            }
        }

        @Test
        @DisplayName("Notification đã đọc rồi thì không save lại")
        void markAsRead_whenAlreadyRead_shouldNotSaveAgain() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                mockNotification.setIsRead(true); // đã đọc sẵn

                when(notificationRepository.findByNotificationIdAndUser_UserId(1L, 1L))
                        .thenReturn(Optional.of(mockNotification));
                when(notificationMapper.toResponse(mockNotification))
                        .thenReturn(mockNotificationResponse);

                // when
                notificationService.maskAsRead(1L);

                // then
                verify(notificationRepository, never()).save(any());
            }
        }

        @Test
        @DisplayName("Ném AppException khi không tìm thấy notification")
        void markAsRead_whenNotificationNotFound_shouldThrowException() {
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.findByNotificationIdAndUser_UserId(99L, 1L))
                        .thenReturn(Optional.empty());

                // when & then
                assertThatThrownBy(() -> notificationService.maskAsRead(99L))
                        .isInstanceOf(AppException.class)
                        .satisfies(ex -> {
                            AppException appException = (AppException) ex;
                            assertThat(appException.getErrorCode()).isEqualTo(ErrorCode.NOTIFICATION_NOT_FOUND);
                        });

                verify(notificationRepository, never()).save(any());
            }
        }
    }


    // markAllAsRead
    @Nested
    @DisplayName("markAllAsRead()")
    class MarkAllAsRead {

        @Test
        @DisplayName("Đánh dấu tất cả đã đọc thành công")
        void markAllAsRead_shouldCallRepositoryWithCorrectUserId() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.markAllAsReadByUserId(1L)).thenReturn(5);

                // when
                notificationService.markAllAsRead();

                // then
                verify(notificationRepository).markAllAsReadByUserId(1L);
            }
        }

        @Test
        @DisplayName("Không có notification nào thì vẫn không lỗi")
        void markAllAsRead_whenNoNotifications_shouldNotThrow() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.markAllAsReadByUserId(1L)).thenReturn(0);

                // when & then
                assertThatCode(() -> notificationService.markAllAsRead())
                        .doesNotThrowAnyException();
            }
        }
    }

    // deleteNotification
    @Nested
    @DisplayName("deleteNotification()")
    class DeleteNotification {

        @Test
        @DisplayName("Xóa notification thành công")
        void deleteNotification_whenExists_shouldDelete() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.findByNotificationIdAndUser_UserId(1L, 1L))
                        .thenReturn(Optional.of(mockNotification));

                // when
                notificationService.deleteNotification(1L);

                // then
                verify(notificationRepository).delete(mockNotification);
            }
        }

        @Test
        @DisplayName("Ném AppException khi notification không tồn tại hoặc không thuộc user")
        void deleteNotification_whenNotFound_shouldThrowException() {
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(notificationRepository.findByNotificationIdAndUser_UserId(99L, 1L))
                        .thenReturn(Optional.empty());

                // when & then
                assertThatThrownBy(() -> notificationService.deleteNotification(99L))
                        .isInstanceOf(AppException.class)
                        .satisfies(ex -> {
                            AppException appException = (AppException) ex;
                            assertThat(appException.getErrorCode()).isEqualTo(ErrorCode.NOTIFICATION_NOT_FOUND);
                        });

                verify(notificationRepository, never()).delete(any());
            }
        }
    }

    // createSystemNotification
    @Nested
    @DisplayName("createSystemNotification()")
    class CreateSystemNotification {

        @Test
        @DisplayName("Broadcast tất cả users khi userIds = null")
        void createSystemNotification_whenUserIdsNull_shouldBroadcastAll() {
            // given
            SystemNotificationRequest request = SystemNotificationRequest.builder()
                    .title("Bảo trì hệ thống")
                    .message("Hệ thống bảo trì lúc 22:00")
                    .userIds(null)
                    .build();

            List<User> allUsers = List.of(
                    User.builder().userId(1L).build(),
                    User.builder().userId(2L).build()
            );

            when(userRepository.findAll()).thenReturn(allUsers);
            when(notificationRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));
            when(notificationMapper.toResponse(any())).thenReturn(mockNotificationResponse);

            // when
            notificationService.createSystemNotification(request);

            // then
            verify(userRepository).findAll();
            verify(notificationRepository).saveAll(anyList());
            verify(sseEmitterManager).broadcastToAll(any(NotificationResponse.class));
            verify(sseEmitterManager, never()).sendToUser(anyLong(), any());
        }

        @Test
        @DisplayName("Gửi tới user cụ thể khi userIds có giá trị")
        void createSystemNotification_whenUserIdsProvided_shouldSendToSpecificUsers() {
            // given
            SystemNotificationRequest request = SystemNotificationRequest.builder()
                    .title("Thông báo riêng")
                    .message("Chỉ gửi cho user 1 và 2")
                    .userIds(List.of(1L, 2L))
                    .build();

            List<User> targetUsers = List.of(
                    User.builder().userId(1L).build(),
                    User.builder().userId(2L).build()
            );

            when(userRepository.findAllById(List.of(1L, 2L))).thenReturn(targetUsers);
            when(notificationRepository.saveAll(anyList())).thenAnswer(i -> i.getArgument(0));
            when(notificationMapper.toResponse(any())).thenReturn(mockNotificationResponse);

            // when
            notificationService.createSystemNotification(request);

            // then
            verify(userRepository).findAllById(List.of(1L, 2L));
            verify(notificationRepository).saveAll(anyList());
            verify(sseEmitterManager, times(2)).sendToUser(anyLong(), any(NotificationResponse.class));
            verify(sseEmitterManager, never()).broadcastToAll(any());
        }
    }

    // createNotification (internal)
    @Nested
    @DisplayName("createNotification() internal")
    class CreateNotification {

        @Test
        @DisplayName("Tạo notification nội bộ thành công và push SSE")
        void createNotification_shouldSaveAndPushSse() {
            // given
            when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
            when(notificationRepository.save(any(Notification.class))).thenReturn(mockNotification);
            when(notificationMapper.toResponse(mockNotification)).thenReturn(mockNotificationResponse);

            // when
            notificationService.createNotification(
                    1L, "Task được assign", "Bạn có task mới",
                    "TASK_ASSIGNED", "Task", 10L
            );

            // then
            verify(notificationRepository).save(any(Notification.class));
            verify(sseEmitterManager).sendToUser(eq(1L), any(NotificationResponse.class));
        }

        @Test
        @DisplayName("Ném AppException khi userId không tồn tại")
        void createNotification_whenUserNotFound_shouldThrowException() {
            // given
            when(userRepository.findById(99L)).thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> notificationService.createNotification(
                    99L, "Title", "Message", "TASK_ASSIGNED", "Task", 1L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode()).isEqualTo(ErrorCode.USER_NOT_FOUND);
                    });

            verify(notificationRepository, never()).save(any());
            verify(sseEmitterManager, never()).sendToUser(anyLong(), any());
        }
    }
}