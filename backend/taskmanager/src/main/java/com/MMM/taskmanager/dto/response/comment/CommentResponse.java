package com.MMM.taskmanager.dto.response.comment;

import com.MMM.taskmanager.dto.response.user.UserSummaryResponse;
import lombok.*;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long commentId;
    private Long taskId;
    private UserSummaryResponse author;
    private String content;

    private Long parentId;

    private int replyCount;

    private boolean isEdited;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
