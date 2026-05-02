package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.response.attachment.AttachmentResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.AttachmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1")
@Tag(name = "Attachment", description = "API quản lý file đính kèm")
public class AttachmentController {
    AttachmentService attachmentService;

    @Operation(
            summary = "Lấy danh sách file đính kèm",
            description = "Lấy toàn bộ file đính kèm của một thực thể (Task, Project, Comment) theo entityType và entityId"
    )

    @GetMapping("/{entityType}/{entityId}/attachments")
    public ResponseEntity<ApiResponse<List<AttachmentResponse>>> getAttachments(
            @Parameter(description = "Loại thực thể (tasks, projects, comments)", example = "tasks")
            @PathVariable String entityType,
            @Parameter(description = "ID của thực thể", example = "1")
            @PathVariable Long entityId) {

        var data = attachmentService.getAttachments(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    @Operation(
            summary = "Upload file đính kèm",
            description = "Tải file lên Cloudinary và gắn vào thực thể. Hỗ trợ: image/*, application/pdf, .docx, .txt. Tối đa 10MB"
    )

    @PostMapping(value = "/{entityType}/{entityId}/attachments",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AttachmentResponse>> uploadAttachment(
            @Parameter(description = "Loại thực thể (tasks, projects, comments)", example = "tasks")
            @PathVariable String entityType,
            @Parameter(description = "ID của thực thể", example = "1")
            @PathVariable Long entityId,
            @Parameter(description = "File cần upload (multipart/form-data)", required = true)
            @RequestPart("file") MultipartFile file) {

        var data = attachmentService.uploadAttachment(entityType, entityId, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(data));
    }

    @Operation(
            summary = "Xóa file đính kèm",
            description = "Xóa file đính kèm khỏi DB và Cloudinary. Chỉ người upload hoặc Admin mới có quyền xóa"
    )

    @DeleteMapping("/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @Parameter(description = "ID của file đính kèm", example = "1")
            @PathVariable Long attachmentId) {

        log.info("attachment id: {}", attachmentId);
        attachmentService.deleteAttachment(attachmentId);
        return ResponseEntity.ok(ApiResponse.ok("Attachment deleted successfully"));
    }

    @Operation(
            summary = "Tải file đính kèm",
            description = "Trả về đường dẫn tải file. Server sẽ redirect (302) tới Cloudinary URL để tải file về"
    )
    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<Void> downloadAttachment(
            @Parameter(description = "ID của file đính kèm", example = "1")
            @PathVariable Long attachmentId) {

        String fileUrl = attachmentService.getDownloadUrl(attachmentId);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(fileUrl))
                .build();
    }
}