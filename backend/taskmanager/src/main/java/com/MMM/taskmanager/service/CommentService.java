package com.MMM.taskmanager.service;

import com.MMM.taskmanager.dto.request.comment.CommentRequest;
import com.MMM.taskmanager.dto.response.comment.CommentResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;

import java.util.List;

public interface CommentService {
    PageResponse<CommentResponse> getCommentsByTaskId(Long taskId, int page, int size);

    List<CommentResponse> getRepliesByParentId(Long parentId);
    CommentResponse createCommentForTask(Long taskId, CommentRequest request);

    CommentResponse updateComment(Long commentId, CommentRequest request);
    void deleteComment(Long commentId);
}
