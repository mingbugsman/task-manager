package com.MMM.taskmanager.service.impl;

import com.MMM.taskmanager.dto.request.comment.CommentRequest;
import com.MMM.taskmanager.dto.response.comment.CommentResponse;
import com.MMM.taskmanager.dto.response.util.PageResponse;
import com.MMM.taskmanager.entity.Comment;
import com.MMM.taskmanager.entity.Task;
import com.MMM.taskmanager.entity.User;
import com.MMM.taskmanager.exception.AppException;
import com.MMM.taskmanager.exception.ErrorCode;
import com.MMM.taskmanager.mapper.CommentMapper;
import com.MMM.taskmanager.repository.CommentRepository;
import com.MMM.taskmanager.repository.ProjectMemberRepository;
import com.MMM.taskmanager.repository.TaskRepository;
import com.MMM.taskmanager.repository.UserRepository;
import com.MMM.taskmanager.entity.type.ActivityLogEntityType;
import com.MMM.taskmanager.service.ActivityLogService;
import com.MMM.taskmanager.service.CommentService;

import com.MMM.taskmanager.util.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final CommentMapper commentMapper;

    // 1. GET

    @Override
    @Transactional(readOnly = true)
    @Cacheable(
            value = "comments:task",
            key   = "#taskId + ':' + #page + ':' + #size"
    )
    public PageResponse<CommentResponse> getCommentsByTaskId(Long taskId, int page, int size) {
        log.info("Lấy danh sách comment [taskId={}, page={}, size={}]", taskId, page, size);

        if (!taskRepository.existsById(taskId)) {
            throw new AppException(ErrorCode.TASK_NOT_FOUND);
        }

        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage = commentRepository.findRootCommentsByTaskId(taskId, pageable);

        List<CommentResponse> items = commentPage.getContent().stream()
                .map(c -> {
                    CommentResponse dto = commentMapper.toResponse(c);
                    dto.setReplyCount(commentRepository
                            .countByParent_CommentIdAndDeletedAtIsNull(c.getCommentId()));
                    return dto;
                })
                .toList();

        return buildPageResponse(items, commentPage, page, size);
    }


    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "comments:replies", key = "#parentId")
    public List<CommentResponse> getRepliesByParentId(Long parentId) {
        log.info("Lấy replies [parentId={}]", parentId);

        if (!commentRepository.existsById(parentId)) {
            throw new AppException(ErrorCode.COMMENT_NOT_FOUND);
        }

        return commentRepository.findRepliesByParentId(parentId)
                .stream()
                .map(commentMapper::toResponse)
                .toList();
    }

    // 2. CREATE


    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "comments:task",    allEntries = true),
            @CacheEvict(value = "comments:project", allEntries = true),
            @CacheEvict(value = "comments:replies",
                    key = "#request.parentId",
                    condition = "#request.parentId != null")
    })
    public CommentResponse createCommentForTask(Long taskId, CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Tạo comment [taskId={}, userId={}]", taskId, userId);

        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorCode.TASK_NOT_FOUND));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Comment comment = Comment.builder()
                .task(task)
                .user(user)
                .content(request.getContent())
                .build();

        // Xử lý reply
        if (request.getParentId() != null) {
            Comment parent = commentRepository.findActiveById(request.getParentId())
                    .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

            // Validate comment cha phải thuộc cùng task
            if (!commentRepository.existsByCommentIdAndTask_TaskIdAndDeletedAtIsNull(
                    parent.getCommentId(), taskId)) {
                throw new AppException(ErrorCode.COMMENT_NOT_BELONG_TO_TASK);
            }

            comment.setParent(parent);
        }

        Comment saved = commentRepository.save(comment);
        log.info("Tạo comment thành công [commentId={}]", saved.getCommentId());

        CommentResponse dto = commentMapper.toResponse(saved);
        dto.setReplyCount(0);
        return dto;
    }


    // 3. UPDATE


    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "comments:task",    allEntries = true),
            @CacheEvict(value = "comments:project", allEntries = true),
            @CacheEvict(value = "comments:replies", allEntries = true)
    })
    public CommentResponse updateComment(Long commentId, CommentRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Cập nhật comment [commentId={}, userId={}]", commentId, userId);

        Comment comment = commentRepository.findActiveById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        // Chỉ tác giả mới được sửa
        if (!commentRepository.existsByCommentIdAndUser_UserIdAndDeletedAtIsNull(
                commentId, userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        comment.setContent(request.getContent());
        Comment updated = commentRepository.save(comment);
        log.info("Cập nhật comment thành công [commentId={}]", commentId);

        CommentResponse dto = commentMapper.toResponse(updated);
        dto.setReplyCount(commentRepository
                .countByParent_CommentIdAndDeletedAtIsNull(commentId));
        return dto;
    }

    // 4. DELETE


    @Override
    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "comments:task",    allEntries = true),
            @CacheEvict(value = "comments:project", allEntries = true),
            @CacheEvict(value = "comments:replies", allEntries = true)
    })
    public void deleteComment(Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Xóa comment [commentId={}, userId={}]", commentId, userId);

        Comment comment = commentRepository.findActiveById(commentId)
                .orElseThrow(() -> new AppException(ErrorCode.COMMENT_NOT_FOUND));

        Long projectId = comment.getTask().getProject().getProjectId();

        boolean isAuthor = commentRepository
                .existsByCommentIdAndUser_UserIdAndDeletedAtIsNull(commentId, userId);
        boolean isAdmin  = projectMemberRepository
                .existsByProject_ProjectIdAndUser_UserIdAndRole(projectId, userId, "Admin");

        if (!isAuthor && !isAdmin) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Soft delete replies trước
        commentRepository.softDeleteRepliesByParentId(commentId, LocalDateTime.now());

        // Soft delete comment
        comment.markDeleted();
        commentRepository.save(comment);
        log.info("Xóa comment thành công [commentId={}]", commentId);
    }

    // PRIVATE HELPERS


    private <T> PageResponse<T> buildPageResponse(
            List<T> items, Page<?> page, int currentPage, int size
    ) {
        return PageResponse.<T>builder()
                .currentPage(currentPage)
                .pageSize(size)
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .items(items)
                .build();
    }
}