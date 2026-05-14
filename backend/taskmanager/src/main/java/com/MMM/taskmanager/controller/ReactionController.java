package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.reaction.ReactionRequest;
import com.MMM.taskmanager.dto.response.reaction.ReactionResponse;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.ReactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ReactionController.java
@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1")
@Tag(name = "Reaction", description = "API quản lý cảm xúc (reaction)")
public class ReactionController {

    ReactionService reactionService;


    // GET /{entityType}/{entityId}/reactions
    @Operation(
            summary = "Lấy danh sách reaction",
            description = "Lấy tổng hợp reaction của một thực thể (comment, notification) gom nhóm theo loại. Trả về cả trạng thái react của user hiện tại"
    )

    @GetMapping("/{entityType}/{entityId}/reactions")
    public ResponseEntity<ApiResponse<List<ReactionResponse>>> getReactions(
            @Parameter(description = "Loại thực thể (comments, notifications)", example = "comments")
            @PathVariable String entityType,
            @Parameter(description = "ID của thực thể", example = "1")
            @PathVariable Long entityId) {

        var data = reactionService.getReactions(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // POST /{entityType}/{entityId}/reactions
    @Operation(
            summary = "Thả hoặc thay đổi reaction",
            description = "Thả một reaction mới hoặc thay đổi reaction hiện tại. Nếu react cùng loại sẽ tự động hủy (toggle off)"
    )
    @PostMapping("/{entityType}/{entityId}/reactions")
    public ResponseEntity<ApiResponse<ReactionResponse>> toggleReaction(
            @Parameter(description = "Loại thực thể (comments, notifications)", example = "comments")
            @PathVariable String entityType,
            @Parameter(description = "ID của thực thể", example = "1")
            @PathVariable Long entityId,
            @RequestBody @Valid ReactionRequest request) {

        var data = reactionService.toggleReaction(entityType, entityId, request);
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    // DELETE /{entityType}/{entityId}/reactions
    @Operation(
            summary = "Hủy reaction",
            description = "Hủy reaction đã thả. Backend tự động lấy userId từ token để xóa đúng bản ghi"
    )

    @DeleteMapping("/{entityType}/{entityId}/reactions")
    public ResponseEntity<ApiResponse<Void>> deleteReaction(
            @Parameter(description = "Loại thực thể (comments, notifications)", example = "comments")
            @PathVariable String entityType,
            @Parameter(description = "ID của thực thể", example = "1")
            @PathVariable Long entityId) {

        reactionService.deleteReaction(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.ok("Reaction removed successfully"));
    }
}