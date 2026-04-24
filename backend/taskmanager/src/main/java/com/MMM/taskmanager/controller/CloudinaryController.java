package com.MMM.taskmanager.controller;


import com.MMM.taskmanager.dto.response.ApiResponse;
import com.MMM.taskmanager.dto.response.CloudinaryResponse;
import com.MMM.taskmanager.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/cloudinary")
@RequiredArgsConstructor
@Tag(name = "Cloudinary", description = "Quản lý tải tập: Avatar, Image, Video và file")
@PreAuthorize("hasRole('ADMIN')")
public class CloudinaryController {

    private final CloudinaryService cloudinaryService;

    @Operation(summary = "Tải lên avatar mới", description = "Kiểm thử chức năng tải lên avatar")
    @PostMapping("/avatar")
    public ResponseEntity<ApiResponse<CloudinaryResponse>> uploadAvatar(
            @Parameter(description = "File ảnh cần upload")
            @RequestParam MultipartFile avatar) {
        var data = cloudinaryService.uploadAvatar(avatar);
        return ResponseEntity.ok(ApiResponse.of(data, "Đã upload avatar lên thành công"));
    }

    @Operation(summary = "Tải lên tệp tin mới", description = "Kiểm thử chức năng tải lên tệp tin")
    @PostMapping("/file")
    public ResponseEntity<ApiResponse<CloudinaryResponse>> uploadFile(
            @Parameter(description = "Tệp tin cần upload")
            @RequestBody MultipartFile file,

            @Parameter(description = "Nơi lưu trữ tệp tin")
            @RequestParam String folder) {
        var data = cloudinaryService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.of(data, "Đã upload tập tin lên thành công"));
    }

    @Operation(summary = "Xóa tệp tin", description = "Kiểm thử chức năng xóa tập tin")
    @DeleteMapping("/file")
    public ResponseEntity<ApiResponse<CloudinaryResponse>> uploadAvatar(
            @Parameter(description = "Tệp tin cần xóa")
            @RequestParam String publicId) {
        cloudinaryService.deleteFile(publicId);
        return ResponseEntity.ok(ApiResponse.ok("Đã xoá tập tin thành công"));
    }
}
