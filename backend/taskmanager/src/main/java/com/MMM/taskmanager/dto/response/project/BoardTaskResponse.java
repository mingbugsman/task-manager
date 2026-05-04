package com.MMM.taskmanager.dto.response.project;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BoardTaskResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private Long taskId;
    private String taskName;
    private String priority;
    private LocalDateTime dueDate;
    private Long assigneeId;
    private String assigneeUsername;
    private String assigneeAvatarUrl;
    private List<String> labels;

}
