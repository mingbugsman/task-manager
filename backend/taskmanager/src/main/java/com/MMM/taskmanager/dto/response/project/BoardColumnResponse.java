package com.MMM.taskmanager.dto.response.project;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BoardColumnResponse implements Serializable {
    @Serial
    private static final long serialVersionUID = 1L;

    private String status;
    private String displayName;
    private int taskCount;
    private List<BoardTaskResponse> tasks;
}
