package com.docservice.careerhub.util;

import com.docservice.careerhub.dto.request.PageQuery;
import com.docservice.careerhub.dto.response.PageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;

public final class PageUtil {

    public static final int MAX_SIZE = 100;
    public static final int DEFAULT_SIZE = 10;

    private PageUtil() {
    }

    public static Pageable toPageable(PageQuery query, String defaultSortBy) {
        int page = Math.max(query.getPage(), 0);
        int size = Math.min(Math.max(query.getSize(), 1), MAX_SIZE);
        String sortBy = hasText(query.getSortBy()) ? query.getSortBy() : defaultSortBy;
        Sort sort = hasText(sortBy) ? Sort.by(directionOf(query.getDirection()), sortBy) : Sort.unsorted();
        return PageRequest.of(page, size, sort);
    }

    public static <T> PageResponse<T> toResponse(Page<?> source, List<T> content) {
        return PageResponse.<T>builder()
                .content(content)
                .page(source.getNumber())
                .size(source.getSize())
                .totalElements(source.getTotalElements())
                .totalPages(source.getTotalPages())
                .last(source.isLast())
                .build();
    }

    private static Sort.Direction directionOf(String direction) {
        return "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
