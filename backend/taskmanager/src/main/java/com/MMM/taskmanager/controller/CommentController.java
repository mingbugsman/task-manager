package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.comment.CommentRequest;
import com.MMM.taskmanager.dto.response.comment.CommentResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1")
public class CommentController {

    private final CommentService commentService;

    // 1. GET

    /**
     * GET /api/v1/tasks/{taskId}/comments?page=0&size=10
     */
    @GetMapping("/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponse<PageResponse<CommentResponse>>> getCommentsByTask(
            @PathVariable Long taskId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        log.debug("GET /tasks/{}/comments - page={}, size={}", taskId, page, size);
        return ResponseEntity.ok(
                ApiResponse.ok(commentService.getCommentsByTaskId(taskId, page, size))
        );
    }



    /**
     * GET /api/v1/comments/{commentId}/replies
     * Lưu ý: đặt TRƯỚC /{projectId} không được vì cùng pattern
     * -> tách riêng bằng /replies suffix
     */
    @GetMapping("/comments/{commentId}/replies")
    public ResponseEntity<ApiResponse<List<CommentResponse>>> getReplies(
            @PathVariable Long commentId
    ) {
        log.debug("GET /comments/{}/replies", commentId);
        return ResponseEntity.ok(
                ApiResponse.ok(commentService.getRepliesByParentId(commentId))
        );
    }

    // 2. CREATE


    /**
     * POST /api/v1/tasks/{taskId}/comments
     * userId lấy từ SecurityUtils bên trong Service
     */
    @PostMapping("/tasks/{taskId}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> createCommentForTask(
            @PathVariable Long taskId,
            @Valid @RequestBody CommentRequest request
    ) {
        log.debug("POST /tasks/{}/comments", taskId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(
                        commentService.createCommentForTask(taskId, request)
                ));
    }




    // 3. UPDATE


    /**
     * PUT /api/v1/comments/{commentId}
     * Chỉ tác giả mới được sửa - kiểm tra trong Service
     */
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<CommentResponse>> updateComment(
            @PathVariable Long commentId,
            @Valid @RequestBody CommentRequest request
    ) {
        log.debug("PUT /comments/{}", commentId);
        return ResponseEntity.ok(
                ApiResponse.ok(commentService.updateComment(commentId, request))
        );
    }

    // 4. DELETE


    /**
     * DELETE /api/v1/comments/{commentId}
     * Soft delete - chỉ tác giả hoặc ADMIN project
     * userId lấy từ SecurityUtils bên trong Service
     */
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long commentId
    ) {
        log.debug("DELETE /comments/{}", commentId);
        commentService.deleteComment(commentId);
        return ResponseEntity.ok(ApiResponse.ok("Xóa bình luận thành công"));
    }
}