package com.MMM.taskmanager.service.impl;

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
import com.MMM.taskmanager.service.AttachmentService;
import com.MMM.taskmanager.service.CloudinaryService;
import com.MMM.taskmanager.util.SecurityUtils;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AttachmentServiceImpl implements AttachmentService {
    AttachmentMapper attachmentMapper;
    AttachmentRepository attachmentRepository;
    UserRepository userRepository;
    CloudinaryService cloudinaryService;

    static final long MAX_FILE_SIZE = 10 * 1024 * 1024L; // 10MB
    static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    @Override
    public List<AttachmentResponse> getAttachments(String entityType, Long entityId) {
        AttachmentEntityType type = AttachmentEntityType.fromPathVariable(entityType);

        List<Attachment> attachments = attachmentRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(type.toString(), entityId);

        return attachmentMapper.toResponseList(attachments);

    }

    @Override
    public AttachmentResponse uploadAttachment(String entityType, Long entityId, MultipartFile file) {
        Long userId = SecurityUtils.getCurrentUserId();
        validateFile(file);

        AttachmentEntityType type = AttachmentEntityType.fromPathVariable(entityType);

        String folder = "attachments/" + type.name().toLowerCase();

        CloudinaryResponse cloudinaryResponse = cloudinaryService.uploadFile(file, folder);

        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Attachment attachment = Attachment.builder()
                .fileName(file.getOriginalFilename())
                .fileUrl(cloudinaryResponse.url())
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .entityType(type.toString())
                .entityId(entityId)
                .user(user)
                .build();

        Attachment saved = attachmentRepository.save(attachment);
        log.info("Uploaded attachment for entityType={} entityId={} by userId={}",
                type, entityId, userId);

        return attachmentMapper.toResponse(saved);
    }

    @Override
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteAttachment(Long attachmentId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Attachment attachment = attachmentRepository.findByAttachmentIdAndUser_UserId(attachmentId, userId)
                    .orElseThrow(() -> new AppException(ErrorCode.ATTACHMENT_NOT_FOUND));

        cloudinaryService.deleteFile(attachment.getFileUrl());

        attachmentRepository.delete(attachment);
        log.info("Deleted attachment id={} by userId={}", attachmentId, userId);
    }

    @Override
    public String getDownloadUrl(Long attachmentId) {
        Attachment attachment = attachmentRepository.findByAttachmentId(attachmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ATTACHMENT_NOT_FOUND));

        return attachment.getFileUrl();
    }

    @Transactional
    public void deleteAllByEntity(String entityType, Long entityId) {
        AttachmentEntityType type = AttachmentEntityType.fromPathVariable(entityType);

        List<Attachment> attachments = attachmentRepository
                .findByEntityTypeAndEntityIdOrderByCreatedAtDesc(type.toString(), entityId);

        attachments.forEach(attachment -> {
             cloudinaryService.deleteFile(attachment.getFileUrl());
        });

        // Bulk delete DB
        attachmentRepository.deleteAllByEntityTypeAndEntityId(type, entityId);
        log.info("Deleted all attachments for entityType={} entityId={}", type, entityId);
    }



    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException(ErrorCode.ATTACHMENT_SIZE_EXCEEDED);
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new AppException(ErrorCode.ATTACHMENT_TYPE_NOT_ALLOWED);
        }
    }
}
