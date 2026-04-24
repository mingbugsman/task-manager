package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.response.cloudinary.CloudinaryResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    CloudinaryResponse uploadAvatar(MultipartFile file);
    CloudinaryResponse uploadFile(MultipartFile file, String folder);
    void deleteFile(String publicId);
}
