package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.response.attachment.AttachmentResponse;
import com.MMM.taskmanager.dto.response.cloudinary.CloudinaryResponse;
import com.MMM.taskmanager.entity.Attachment;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.entity.type.AttachmentEntityType;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.AttachmentMapper;
import com.MMM.taskmanager.repository.AttachmentRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.service.impl.AttachmentServiceImpl;
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
import org.springframework.mock.web.MockMultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttachmentServiceImplTest {

    @Mock
    private AttachmentRepository attachmentRepository;

    @Mock
    private AttachmentMapper attachmentMapper;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AttachmentServiceImpl attachmentService;

    // Test data
    private User mockUser;
    private Attachment mockAttachment;
    private AttachmentResponse mockAttachmentResponse;
    private MockMultipartFile mockFile;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .userId(1L)
                .build();

        mockAttachment = Attachment.builder()
                .attachmentId(1L)
                .fileName("test.pdf")
                .fileUrl("https://res.cloudinary.com/test/upload/v123/attachments/task/test.pdf")
                .fileType("application/pdf")
                .fileSize(1024L)
                .entityType(AttachmentEntityType.TASK.toString())
                .entityId(10L)
                .user(mockUser)
                .build();

        mockAttachmentResponse = AttachmentResponse.builder()
                .attachmentId(1L)
                .fileName("test.pdf")
                .fileUrl("https://res.cloudinary.com/test/upload/v123/attachments/task/test.pdf")
                .fileType("application/pdf")
                .fileSize(1024L)
                .entityType(AttachmentEntityType.TASK)
                .entityId(10L)
                .uploadedBy(1L)
                .build();

        mockFile = new MockMultipartFile(
                "file",
                "test.pdf",
                "application/pdf",
                new byte[1024] // 1KB
        );
    }

    // getAttachments
    @Nested
    @DisplayName("getAttachments()")
    class GetAttachments {

        @Test
        @DisplayName("Lấy danh sách attachment thành công")
        void getAttachments_shouldReturnList() {
            // given
            when(attachmentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                    AttachmentEntityType.TASK, 10L))
                    .thenReturn(List.of(mockAttachment));
            when(attachmentMapper.toResponseList(List.of(mockAttachment)))
                    .thenReturn(List.of(mockAttachmentResponse));

            // when
            List<AttachmentResponse> result = attachmentService.getAttachments("tasks", 10L);

            // then
            assertThat(result).hasSize(1);
            assertThat(result.get(0).getAttachmentId()).isEqualTo(1L);
            assertThat(result.get(0).getFileName()).isEqualTo("test.pdf");
            verify(attachmentRepository)
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(AttachmentEntityType.TASK, 10L);
        }

        @Test
        @DisplayName("Trả về danh sách rỗng khi không có attachment")
        void getAttachments_whenEmpty_shouldReturnEmptyList() {
            // arrange
            when(attachmentRepository.findByEntityTypeAndEntityIdOrderByCreatedAtDesc(
                    AttachmentEntityType.TASK, 10L))
                    .thenReturn(List.of());
            when(attachmentMapper.toResponseList(List.of())).thenReturn(List.of());

            // when
            List<AttachmentResponse> result = attachmentService.getAttachments("tasks", 10L);

            // then
            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("Ném AppException khi entityType không hợp lệ")
        void getAttachments_whenInvalidEntityType_shouldThrowException() {
            // when & then
            assertThatThrownBy(() -> attachmentService.getAttachments("invalid", 10L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.INVALID_ENTITY_TYPE);
                    });

            verify(attachmentRepository, never())
                    .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(any(), any());
        }
    }

    // uploadAttachment
    @Nested
    @DisplayName("uploadAttachment()")
    class UploadAttachment {

        @Test
        @DisplayName("Upload file thành công")
        void uploadAttachment_whenValidFile_shouldReturnResponse() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                CloudinaryResponse cloudinaryResponse = new CloudinaryResponse(
                        "attachments/task/test",
                        "https://res.cloudinary.com/test/upload/v123/attachments/task/test.pdf",
                        "pdf",
                        1024L,
                        "raw"
                );

                when(cloudinaryService.uploadFile(mockFile, "attachments/task"))
                        .thenReturn(cloudinaryResponse);
                when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
                when(attachmentRepository.save(any(Attachment.class))).thenReturn(mockAttachment);
                when(attachmentMapper.toResponse(mockAttachment)).thenReturn(mockAttachmentResponse);

                // when
                AttachmentResponse result = attachmentService.uploadAttachment("tasks", 10L, mockFile);

                // then
                assertThat(result).isNotNull();
                assertThat(result.getFileName()).isEqualTo("test.pdf");
                assertThat(result.getFileType()).isEqualTo("application/pdf");
                verify(cloudinaryService).uploadFile(mockFile, "attachments/task");
                verify(attachmentRepository).save(any(Attachment.class));
            }
        }

        @Test
        @DisplayName("Ném AppException khi file rỗng")
        void uploadAttachment_whenFileEmpty_shouldThrowException() {
            // given
            MockMultipartFile emptyFile = new MockMultipartFile(
                    "file", "empty.pdf", "application/pdf", new byte[0]);

            // when & then
            assertThatThrownBy(() -> attachmentService.uploadAttachment("tasks", 10L, emptyFile))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode()).isEqualTo(ErrorCode.FILE_IS_EMPTY);
                    });

            verify(cloudinaryService, never()).uploadFile(any(), any());
            verify(attachmentRepository, never()).save(any());
        }

        @Test
        @DisplayName("Ném AppException khi file vượt quá 10MB")
        void uploadAttachment_whenFileTooLarge_shouldThrowException() {
            // given2
            MockMultipartFile largeFile = new MockMultipartFile(
                    "file", "large.pdf", "application/pdf",
                    new byte[11 * 1024 * 1024] // 11MB
            );

            // when & then
            assertThatThrownBy(() -> attachmentService.uploadAttachment("tasks", 10L, largeFile))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.ATTACHMENT_SIZE_EXCEEDED);
                    });

            verify(cloudinaryService, never()).uploadFile(any(), any());
        }

        @Test
        @DisplayName("Ném AppException khi file type không được phép")
        void uploadAttachment_whenFileTypeNotAllowed_shouldThrowException() {
            // given
            MockMultipartFile exeFile = new MockMultipartFile(
                    "file", "virus.exe", "application/x-msdownload", new byte[1024]);

            // when & then
            assertThatThrownBy(() -> attachmentService.uploadAttachment("tasks", 10L, exeFile))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.ATTACHMENT_TYPE_NOT_ALLOWED);
                    });

            verify(cloudinaryService, never()).uploadFile(any(), any());
        }
    }

    // =========================================================
    // deleteAttachment
    // =========================================================
    @Nested
    @DisplayName("deleteAttachment()")
    class DeleteAttachment {

        @Test
        @DisplayName("User thường xóa attachment của chính mình thành công")
        void deleteAttachment_whenOwner_shouldDelete() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(attachmentRepository.findByAttachmentIdAndUser_UserId(1L, 1L))
                        .thenReturn(Optional.of(mockAttachment));

                // when
                attachmentService.deleteAttachment(1L);

                // then
                verify(cloudinaryService).deleteFile(mockAttachment.getFileUrl());
                verify(attachmentRepository).delete(mockAttachment);
            }
        }

        @Test
        @DisplayName("Ném AppException khi user thường xóa attachment không phải của mình")
        void deleteAttachment_whenNotOwner_shouldThrowException() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(2L); // user khác

                when(attachmentRepository.findByAttachmentIdAndUser_UserId(1L, 2L))
                        .thenReturn(Optional.empty());

                // when & then
                assertThatThrownBy(() -> attachmentService.deleteAttachment(1L))
                        .isInstanceOf(AppException.class)
                        .satisfies(ex -> {
                            AppException appException = (AppException) ex;
                            assertThat(appException.getErrorCode())
                                    .isEqualTo(ErrorCode.ATTACHMENT_NOT_FOUND);
                        });

                verify(cloudinaryService, never()).deleteFile(any());
                verify(attachmentRepository, never()).delete(any());
            }
        }

        @Test
        @DisplayName("Ném AppException khi attachment không tồn tại")
        void deleteAttachment_whenNotFound_shouldThrowException() {
            // given
            try (MockedStatic<SecurityUtils> securityUtils = Mockito.mockStatic(SecurityUtils.class)) {
                securityUtils.when(SecurityUtils::getCurrentUserId).thenReturn(1L);

                when(attachmentRepository.findByAttachmentIdAndUser_UserId(99L, 1L))
                        .thenReturn(Optional.empty());

                // when & then
                assertThatThrownBy(() -> attachmentService.deleteAttachment(99L))
                        .isInstanceOf(AppException.class)
                        .satisfies(ex -> {
                            AppException appException = (AppException) ex;
                            assertThat(appException.getErrorCode())
                                    .isEqualTo(ErrorCode.ATTACHMENT_NOT_FOUND);
                        });

                verify(cloudinaryService, never()).deleteFile(any());
                verify(attachmentRepository, never()).delete(any());
            }
        }
    }

    // getDownloadUrl
    @Nested
    @DisplayName("getDownloadUrl()")
    class GetDownloadUrl {

        @Test
        @DisplayName("Trả về fileUrl thành công")
        void getDownloadUrl_whenExists_shouldReturnUrl() {
            // given
            when(attachmentRepository.findByAttachmentId(1L))
                    .thenReturn(Optional.of(mockAttachment));

            // when
            String url = attachmentService.getDownloadUrl(1L);

            // then
            assertThat(url).isEqualTo(mockAttachment.getFileUrl());
            verify(attachmentRepository).findByAttachmentId(1L);
        }

        @Test
        @DisplayName("Ném AppException khi attachment không tồn tại")
        void getDownloadUrl_whenNotFound_shouldThrowException() {
            // given
            when(attachmentRepository.findByAttachmentId(99L))
                    .thenReturn(Optional.empty());

            // when & then
            assertThatThrownBy(() -> attachmentService.getDownloadUrl(99L))
                    .isInstanceOf(AppException.class)
                    .satisfies(ex -> {
                        AppException appException = (AppException) ex;
                        assertThat(appException.getErrorCode())
                                .isEqualTo(ErrorCode.ATTACHMENT_NOT_FOUND);
                    });
        }
    }
}