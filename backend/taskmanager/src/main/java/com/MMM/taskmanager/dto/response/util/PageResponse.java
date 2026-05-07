package com.MMM.taskmanager.dto.response.util;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.io.Serializable;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> implements Serializable {
    int currentPage;
    int pageSize;
    int totalPages;
    long totalElements;
    boolean hasNext;
    boolean hasPrevious;
    List<T> items;
}
