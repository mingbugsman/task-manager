package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.attachment.AttachmentResponse;
import com.MMM.taskmanager.entity.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "Spring")
public interface AttachmentMapper {

    @Mapping(target = "uploadedBy", source = "user.userId")
    AttachmentResponse toResponse(Attachment attachment);

    List<AttachmentResponse> toResponseList(List<Attachment> attachments);
}
