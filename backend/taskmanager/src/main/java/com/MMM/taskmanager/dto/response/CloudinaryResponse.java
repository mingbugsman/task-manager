package com.MMM.taskmanager.dto.response;

public record CloudinaryResponse(
        String publicId,
        String url,
        String format,
        Long bytes,
        String resourceType
) {
}
