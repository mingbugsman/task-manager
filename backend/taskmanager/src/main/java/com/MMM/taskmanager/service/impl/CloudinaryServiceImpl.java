package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.response.cloudinary.CloudinaryResponse;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CloudinaryServiceImpl implements CloudinaryService {
    Cloudinary cloudinary;

    @Override
    public CloudinaryResponse uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        }
        try {
            var options = ObjectUtils.asMap(
                    "folder", "avatar",
                    "resource_type", "image",
                    "transformation", new Transformation<>()
                            .width(500).height(500).crop("thumb").gravity("face")
            );
            return executeUpload(file, options);
        } catch (RuntimeException e) {
            log.error("Error when upload avatar: {}",e.getMessage());
            throw new AppException(ErrorCode.ATTACHMENT_TYPE_NOT_ALLOWED);
        }
    }

    @Override
    public CloudinaryResponse uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        }
        try {
            String contentType = file.getContentType();

            String resourceType;
            if (contentType != null && contentType.startsWith("image/")) {
                resourceType = "image";
            } else if (contentType != null && contentType.equals("video/mp4")) {
                resourceType = "video";
            } else {
                resourceType = "raw";
            }

            var options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "use_filename", true,
                    "unique_filename", true,
                    "filename_override", file.getOriginalFilename(),
                    "access_mode", "public"
            );
            return executeUpload(file, options);
        } catch (RuntimeException e) {
            log.error("Error when upload file:", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteFile(String url) {
        String publicId = extractPublicIdFromUrl(url);

        log.info("Deleting file with url={}", url);
        log.info("Extracted publicId={}", publicId);

        if (publicId == null) {
            throw new AppException(ErrorCode.ATTACHMENT_NOT_FOUND);
        }
        try {
            String resourceType = extractResourceTypeFromUrl(url);
            log.info("Resource type={}", resourceType);

            Map result = cloudinary.uploader().destroy(publicId,
                    ObjectUtils.asMap("resource_type", resourceType));


//            if ("not found".equals(result.get("result"))) {
//                log.warn("File not found on Cloudinary, publicId={}", publicId);
//            }
        } catch (IOException e) {
            throw new AppException(ErrorCode.ATTACHMENT_DELETE_FAILED);
        }
    }

    private String extractPublicIdFromUrl(String url) {
        if (url == null || url.isBlank()) {
            return null;
        }
        try {
            int uploadIndex = url.indexOf("/upload/");
            if (uploadIndex == -1) {
                return null;
            }
            String path = url.substring(uploadIndex + 8);

            path = URLDecoder.decode(path, StandardCharsets.UTF_8);

            if (path.matches("^v\\d+/.*")) {
                path = path.replaceFirst("^v\\d+/", "");
            }

            if (!url.contains("/raw/upload/")) {
                int dotIndex = path.lastIndexOf(".");
                if (dotIndex != -1) {
                    path = path.substring(0, dotIndex);
                }
            }

            return path;
        } catch (Exception e) {
            log.error("Failed to extract publicId from url: {}", url, e);
            return null;
        }
    }

    private String extractResourceTypeFromUrl(String url) {
        if (url.contains("/image/upload/")) return "image";
        if (url.contains("/video/upload/")) return "video";
        if (url.contains("/raw/upload/"))   return "raw";
        return "image";
    }

    private CloudinaryResponse executeUpload(MultipartFile file, Map options) {
        try {
            Map result = cloudinary.uploader().upload(file.getBytes(), options);

            return new CloudinaryResponse(
                    (String) result.get("public_id"),
                    (String) result.get("secure_url"),
                    (String) result.get("format"),
                    Long.valueOf(result.get("bytes").toString()),
                    (String) result.get("resource_type")
            );
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}
