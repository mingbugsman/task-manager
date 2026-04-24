package com.MMM.taskmanager.dto.response.util;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PageResponse<T> {
    int currentPage;
    int pageSize;
    int totalPages;
    long totalElements;
    boolean hasNext;
    boolean hasPrevious;
    List<T> items;

}
