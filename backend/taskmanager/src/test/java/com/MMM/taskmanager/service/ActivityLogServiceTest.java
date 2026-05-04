package com.MMM.taskmanager.service;


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
import com.MMM.taskmanager.service.impl.ActivityLogServiceImpl;
import com.MMM.taskmanager.util.SecurityUtils;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ActivityLogServiceTest {

    @Mock
    private ActivityLogRepository activityLogRepository;

    @Mock
    private ActivityLogMapper activityLogMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ActivityLogServiceImpl activityLogService;

    private User mockUser;
    private Project mockProject;
    private ActivityLog mockActivityLog;
    private ActivityLogResponse mockActivityLogResponse;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(4L)
                .userName("kujo_jotaro")
                .build();

        mockProject = Project.builder()
                .projectId(1L)
                .build();

        mockActivityLog = ActivityLog.builder()
                .activityLogId(1L)
                .user(mockUser)
                .action("CREATE")
                .entityType(ActivityLogEntityType.TASK)
                .entityId(1L)
                .metadata("{\"taskName\": \"Thiết kế UI\"}")
                .project(null)
                .ipAddress("192.168.1.1")
                .build();

        mockActivityLogResponse = ActivityLogResponse.builder()
                .activityLogId(1L)
                .userId(4L)
                .userName("kujo_jotaro")
                .action("CREATE")
                .entityType(ActivityLogEntityType.TASK)
                .entityId(1L)
                .metadata("{\"taskName\": \"Thiết kế UI\"}")
                .ipAddress("192.168.1.1")
                .build();
    }
    @Nested
    @DisplayName("getActivities()")
    class GetActivities {

        @Test
        @DisplayName("Lấy danh sách log theo entityType và entityId thành công")
        void getActivities_shouldReturnPageResponse() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<ActivityLog> page = new PageImpl<>(List.of(mockActivityLog), pageable, 1);

            when(activityLogRepository
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                            ActivityLogEntityType.TASK, 1L, pageable))
                    .thenReturn(page);
            when(activityLogMapper.toResponseList(List.of(mockActivityLog)))
                    .thenReturn(List.of(mockActivityLogResponse));

            // when
            PageResponse<ActivityLogResponse> result =
                    activityLogService.getActivities("TASK", 1L, 0, 20);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getItems()).hasSize(1);
            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getCurrentPage()).isEqualTo(0);
            verify(activityLogRepository)
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                            ActivityLogEntityType.TASK, 1L, pageable);
        }

        @Test
        @DisplayName("Trả về danh sách rỗng khi không có log")
        void getActivities_whenEmpty_shouldReturnEmptyPage() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<ActivityLog> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(activityLogRepository
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                            ActivityLogEntityType.TASK, 99L, pageable))
                    .thenReturn(emptyPage);
            when(activityLogMapper.toResponseList(List.of())).thenReturn(List.of());

            // when
            PageResponse<ActivityLogResponse> result =
                    activityLogService.getActivities("TASK", 99L, 0, 20);

            // then
            assertThat(result.getItems()).isEmpty();
            assertThat(result.getTotalElements()).isEqualTo(0);
        }

        @Test
        @DisplayName("Ném AppException khi entityType không hợp lệ")
        void getActivities_whenInvalidEntityType_shouldThrowException() {
            // when & then
            assertThatThrownBy(() -> activityLogService.getActivities("INVALID", 1L, 0, 20))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.INVALID_ENTITY_TYPE);
                    });

            verify(activityLogRepository, never())
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(any(), any(), any());
        }
    }


    @Nested
    @DisplayName("getActivityDetail()")
    class GetActivityDetail {

        @Test
        @DisplayName("Lấy chi tiết log thành công")
        void getActivityDetail_whenExists_shouldReturnResponse() {
            // given
            when(activityLogRepository.findByActivityLogId(1L))
                    .thenReturn(Optional.of(mockActivityLog));
            when(activityLogMapper.toResponse(mockActivityLog))
                    .thenReturn(mockActivityLogResponse);

            // when
            ActivityLogResponse result = activityLogService.getActivityDetail(1L);

            // then
            assertThat(result).isNotNull();
            assertThat(result.getActivityLogId()).isEqualTo(1L);
            assertThat(result.getAction()).isEqualTo("CREATE");
            verify(activityLogRepository).findByActivityLogId(1L);
        }

        @Test
        @DisplayName("Ném AppException khi log không tồn tại")
        void getActivityDetail_whenNotFound_shouldThrowException() {
            // given
            when(activityLogRepository.findByActivityLogId(99L))
                    .thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> activityLogService.getActivityDetail(99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.ACTIVITY_LOG_NOT_FOUND);
                    });
        }
    }

    // =========================================================
    // getActivitiesByProject
    // =========================================================
    @Nested
    @DisplayName("getActivitiesByProject()")
    class GetActivitiesByProject {

        @Test
        @DisplayName("Lấy danh sách log theo project thành công")
        void getActivitiesByProject_shouldReturnPageResponse() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<ActivityLog> page = new PageImpl<>(List.of(mockActivityLog), pageable, 1);

            when(activityLogRepository
                    .findByProject_ProjectIdOrderByCreatedAtDesc(1L, pageable))
                    .thenReturn(page);
            when(activityLogMapper.toResponseList(List.of(mockActivityLog)))
                    .thenReturn(List.of(mockActivityLogResponse));

            // when
            PageResponse<ActivityLogResponse> result =
                    activityLogService.getActivitiesByProject(1L, 0, 20);

            // then
            assertThat(result.getItems()).hasSize(1);
            verify(activityLogRepository)
                    .findByProject_ProjectIdOrderByCreatedAtDesc(1L, pageable);
        }

        @Test
        @DisplayName("Trả về danh sách rỗng khi project không có log")
        void getActivitiesByProject_whenEmpty_shouldReturnEmptyPage() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<ActivityLog> emptyPage = new PageImpl<>(List.of(), pageable, 0);

            when(activityLogRepository
                    .findByProject_ProjectIdOrderByCreatedAtDesc(99L, pageable))
                    .thenReturn(emptyPage);
            when(activityLogMapper.toResponseList(List.of())).thenReturn(List.of());

            // when
            PageResponse<ActivityLogResponse> result =
                    activityLogService.getActivitiesByProject(99L, 0, 20);

            // then
            assertThat(result.getItems()).isEmpty();
        }
    }

    // =========================================================
    // getActivitiesByUser
    // =========================================================
    @Nested
    @DisplayName("getActivitiesByUser()")
    class GetActivitiesByUser {

        @Test
        @DisplayName("Lấy danh sách log theo user thành công")
        void getActivitiesByUser_shouldReturnPageResponse() {
            // given
            Pageable pageable = PageRequest.of(0, 20);
            Page<ActivityLog> page = new PageImpl<>(List.of(mockActivityLog), pageable, 1);

            when(userRepository.existsById(4L)).thenReturn(true);
            when(activityLogRepository
                    .findByUser_UserIdOrderByCreatedAtDesc(4L, pageable))
                    .thenReturn(page);
            when(activityLogMapper.toResponseList(List.of(mockActivityLog)))
                    .thenReturn(List.of(mockActivityLogResponse));

            // when
            PageResponse<ActivityLogResponse> result =
                    activityLogService.getActivitiesByUser(4L, 0, 20);

            // then
            assertThat(result.getItems()).hasSize(1);
            assertThat(result.getItems().get(0).getUserId()).isEqualTo(4L);
            verify(userRepository).existsById(4L);
            verify(activityLogRepository)
                    .findByUser_UserIdOrderByCreatedAtDesc(4L, pageable);
        }

        @Test
        @DisplayName("Ném AppException khi user không tồn tại")
        void getActivitiesByUser_whenUserNotFound_shouldThrowException() {
            // given
            when(userRepository.existsById(99L)).thenReturn(false);

            // when & then
            assertThatThrownBy(() -> activityLogService.getActivitiesByUser(99L, 0, 20))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.USER_NOT_FOUND);
                    });

            verify(activityLogRepository, never())
                    .findByUser_UserIdOrderByCreatedAtDesc(any(), any());
        }
    }

    // =========================================================
    // getMyActivities
    // =========================================================
    @Nested
    @DisplayName("getMyActivities()")
    class GetMyActivities {

        @Test
        @DisplayName("Lấy danh sách log của chính mình thành công")
        void getMyActivities_shouldReturnPageResponse() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(4L);

                Pageable pageable = PageRequest.of(0, 20);
                Page<ActivityLog> page = new PageImpl<>(List.of(mockActivityLog), pageable, 1);

                when(activityLogRepository
                        .findByUser_UserIdOrderByCreatedAtDesc(4L, pageable))
                        .thenReturn(page);
                when(activityLogMapper.toResponseList(List.of(mockActivityLog)))
                        .thenReturn(List.of(mockActivityLogResponse));

                // when
                PageResponse<ActivityLogResponse> result =
                        activityLogService.getMyActivities(0, 20);

                // then
                assertThat(result.getItems()).hasSize(1);
                verify(activityLogRepository)
                        .findByUser_UserIdOrderByCreatedAtDesc(4L, pageable);
            }
        }

        @Test
        @DisplayName("Trả về danh sách rỗng khi không có log")
        void getMyActivities_whenEmpty_shouldReturnEmptyPage() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(4L);

                Pageable pageable = PageRequest.of(0, 20);
                Page<ActivityLog> emptyPage = new PageImpl<>(List.of(), pageable, 0);

                when(activityLogRepository
                        .findByUser_UserIdOrderByCreatedAtDesc(4L, pageable))
                        .thenReturn(emptyPage);
                when(activityLogMapper.toResponseList(List.of())).thenReturn(List.of());

                // when
                PageResponse<ActivityLogResponse> result =
                        activityLogService.getMyActivities(0, 20);

                // then
                assertThat(result.getItems()).isEmpty();
                assertThat(result.getTotalElements()).isEqualTo(0);
            }
        }
    }

    // =========================================================
    // createActivityLog
    // =========================================================
    @Nested
    @DisplayName("createActivityLog()")
    class CreateActivityLog {

        @Test
        @DisplayName("Tạo log không có projectId thành công")
        void createActivityLog_whenNoProject_shouldSave() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(4L);

                ActivityLogRequest request = ActivityLogRequest.builder()
                        .action("CREATE")
                        .entityType(ActivityLogEntityType.TASK)
                        .entityId(1L)
                        .projectId(null)
                        .ipAddress("192.168.1.1")
                        .metadata("{\"taskName\": \"Thiết kế UI\"}")
                        .build();

                when(userRepository.findById(4L)).thenReturn(Optional.of(mockUser));
                when(activityLogRepository.save(any(ActivityLog.class)))
                        .thenReturn(mockActivityLog);

                // when
                activityLogService.createActivityLog(request);

                // then
                verify(activityLogRepository).save(any(ActivityLog.class));
                verify(projectRepository, never()).findById(any());
            }
        }

        @Test
        @DisplayName("Tạo log có projectId thành công")
        void createActivityLog_whenWithProject_shouldSave() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(4L);

                ActivityLogRequest request = ActivityLogRequest.builder()
                        .action("CREATE")
                        .entityType(ActivityLogEntityType.TASK)
                        .entityId(1L)
                        .projectId(1L)
                        .ipAddress("192.168.1.1")
                        .metadata("{\"taskName\": \"Thiết kế UI\"}")
                        .build();

                when(userRepository.findById(4L)).thenReturn(Optional.of(mockUser));
                when(projectRepository.findById(1L)).thenReturn(Optional.of(mockProject));
                when(activityLogRepository.save(any(ActivityLog.class)))
                        .thenReturn(mockActivityLog);

                // when
                activityLogService.createActivityLog(request);

                // then
                verify(activityLogRepository).save(any(ActivityLog.class));
                verify(projectRepository).findById(1L);
            }
        }

        @Test
        @DisplayName("Ném AppException khi user không tồn tại")
        void createActivityLog_whenUserNotFound_shouldThrowException() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(99L);

                ActivityLogRequest request = ActivityLogRequest.builder()
                        .action("CREATE")
                        .entityType(ActivityLogEntityType.TASK)
                        .entityId(1L)
                        .build();

                when(userRepository.findById(99L)).thenReturn(Optional.empty());

                // when & then
                assertThatThrownBy(() -> activityLogService.createActivityLog(request))
                        .isInstanceOf(AppException.class)
                        .satisfies(ex -> {
                            AppException appException = (AppException) ex;
                            assertThat(appException.getErrorCode())
                                    .isEqualTo(ErrorCode.USER_NOT_FOUND);
                        });

                verify(activityLogRepository, never()).save(any());
            }
        }

        @Test
        @DisplayName("Ném AppException khi projectId không tồn tại")
        void createActivityLog_whenProjectNotFound_shouldThrowException() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(4L);

                ActivityLogRequest request = ActivityLogRequest.builder()
                        .action("CREATE")
                        .entityType(ActivityLogEntityType.TASK)
                        .entityId(1L)
                        .projectId(99L)
                        .build();

                when(userRepository.findById(4L)).thenReturn(Optional.of(mockUser));
                when(projectRepository.findById(99L)).thenReturn(Optional.empty());

                // when & then
                assertThatThrownBy(() -> activityLogService.createActivityLog(request))
                        .isInstanceOf(AppException.class)
                        .satisfies(ex -> {
                            AppException appException = (AppException) ex;
                            assertThat(appException.getErrorCode())
                                    .isEqualTo(ErrorCode.PROJECT_NOT_FOUND);
                        });

                verify(activityLogRepository, never()).save(any());
            }
        }
    }

    // =========================================================
    // deleteOldActivityLogs
    // =========================================================
    @Nested
    @DisplayName("deleteOldActivityLogs()")
    class DeleteOldActivityLogs {

        @Test
        @DisplayName("Xóa log cũ thành công và trả về số lượng đã xóa")
        void deleteOldActivityLogs_shouldReturnDeletedCount() {
            // given
            LocalDateTime before = LocalDateTime.of(2026, 4, 2, 0, 0, 0);
            when(activityLogRepository.deleteByCreatedAtBefore(before)).thenReturn(5);

            // when
            int deleted = activityLogService.deleteOldActivity(before);

            // then
            assertThat(deleted).isEqualTo(5);
            verify(activityLogRepository).deleteByCreatedAtBefore(before);
        }

        @Test
        @DisplayName("Trả về 0 khi không có log nào cần xóa")
        void deleteOldActivityLogs_whenNoLogsToDelete_shouldReturnZero() {
            // given
            LocalDateTime before = LocalDateTime.of(2020, 1, 1, 0, 0, 0);
            when(activityLogRepository.deleteByCreatedAtBefore(before)).thenReturn(0);

            // when
            int deleted = activityLogService.deleteOldActivity(before);

            // then
            assertThat(deleted).isEqualTo(0);
            verify(activityLogRepository).deleteByCreatedAtBefore(before);
        }
    }
}
