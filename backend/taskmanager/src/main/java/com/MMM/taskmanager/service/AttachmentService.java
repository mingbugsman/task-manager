package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.response.attachment.AttachmentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AttachmentService {
    List<AttachmentResponse> getAttachments(String entityType, Long entityId);
    AttachmentResponse uploadAttachment(String entityType, Long entityId, MultipartFile file);
    void deleteAttachment(Long attachmentId);
    String getDownloadUrl(Long attachmentId);
}
