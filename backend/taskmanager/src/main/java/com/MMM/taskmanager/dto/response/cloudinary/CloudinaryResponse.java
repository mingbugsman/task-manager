package com.MMM.taskmanager.dto.response.cloudinary;

public record CloudinaryResponse(
        String publicId,
        String url,
        String format,
        Long bytes,
        String resourceType
) {
}
