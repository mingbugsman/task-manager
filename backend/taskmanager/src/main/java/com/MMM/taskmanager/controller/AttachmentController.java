package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.response.attachment.AttachmentResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.AttachmentService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1")
public class AttachmentController {
    AttachmentService attachmentService;

    @GetMapping("/{entityType}/{entityId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachments(
            @PathVariable String entityType,
            @PathVariable Long entityId) {

       var data = attachmentService.getAttachments(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }



    @PostMapping(value = "/{entityType}/{entityId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestPart("file") MultipartFile file) {

        var data =  attachmentService.uploadAttachment(entityType, entityId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(data));
    }


    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long attachmentId) {

        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.ok(ApiResponse.ok("Attachment deleted successfully"));
    }


    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Void> downloadAttachment(
            @PathVariable Long attachmentId) {

        String fileUrl = attachmentService.getDownloadUrl(attachmentId);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(fileUrl))
                .build();
    }
}
