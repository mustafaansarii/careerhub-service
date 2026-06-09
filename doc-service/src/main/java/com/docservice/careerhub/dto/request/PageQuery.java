package com.docservice.careerhub.dto.request;

import lombok.Data;

@Data
public class PageQuery {

    private String keyword;

    private int page = 0;

    private int size = 10;

    private String sortBy;

    private String direction = "desc";
}
