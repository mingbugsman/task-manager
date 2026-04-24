package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.response.CloudinaryResponse;
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
    public CloudinaryResponse uploadFile(MultipartFile file, String folder)  {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.FILE_IS_EMPTY);
        }
        try {
            var options = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "auto"
            );
            return executeUpload(file, options);
        } catch (RuntimeException e) {
            log.error("Error when upload file:", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        }
        catch (IOException e) {
            throw new AppException(ErrorCode.ATTACHMENT_DELETE_FAILED);
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
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
