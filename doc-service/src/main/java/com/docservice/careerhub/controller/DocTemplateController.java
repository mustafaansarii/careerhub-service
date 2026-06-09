package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.dto.request.PageQuery;
import com.docservice.careerhub.dto.response.DocTemplateMetadata;
import com.docservice.careerhub.dto.response.PageResponse;
import com.docservice.careerhub.dtoApi.DocTemplateDtoApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/doc-templates")
public class DocTemplateController {

    @Autowired
    private DocTemplateDtoApi docTemplateDtoApi;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public List<DocTemplateMetadata> create(@RequestBody List<CreateDocTemplateRequest> requests) {
        return docTemplateDtoApi.create(requests);
    }

    @GetMapping("/{id}")
    public DocTemplateMetadata get(@PathVariable Long id) {
        return docTemplateDtoApi.getMetadata(id);
    }

    @GetMapping
    public PageResponse<DocTemplateMetadata> list(PageQuery query,
                                                  @RequestParam(required = false) DocType type) {
        return docTemplateDtoApi.listMetadata(query, type);
    }
}
