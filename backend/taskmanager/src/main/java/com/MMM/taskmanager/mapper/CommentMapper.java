package com.MMM.taskmanager.mapper;

import com.MMM.taskmanager.dto.response.comment.CommentResponse;
import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import com.MMM.taskmanager.entity.Comment;
import com.MMM.taskmanager.entity.User;

import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface CommentMapper {

    @Mapping(target = "taskId",    source = "task.taskId")
    @Mapping(target = "author",    source = "comment.user")
    @Mapping(target = "parentId",  source = "parent.commentId")
    @Mapping(target = "isEdited",  expression = "java(comment.isEdited())")
    @Mapping(target = "replyCount", ignore = true) // set thủ công trong Service
    CommentResponse toResponse(Comment comment);

    @Mapping(target = "userId",    source = "userId")
    @Mapping(target = "fullName",  source = "userName")
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    UserSummaryResponse toUserSummaryDTO(User user);
}