package com.MMM.taskmanager.dto.response.attachment;

import com.MMM.taskmanager.entity.type.AttachmentEntityType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttachmentResponse {

    private Long attachmentId;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private AttachmentEntityType entityType;
    private Long entityId;
    private Long uploadedBy;
    private LocalDateTime createdAt;
}