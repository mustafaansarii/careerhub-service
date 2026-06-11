package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class DocTemplateService {

    private static final Logger LOGGER = LoggerFactory.getLogger(DocTemplateService.class);
    private static final int MAX_ERROR_LENGTH = 2000;

    @Autowired
    private DocTemplateRepository docTemplateRepository;

    @Autowired
    private LatexCompiler latexCompiler;

    @Autowired
    private StorageService storageService;

    public List<DocTemplate> createAll(List<CreateDocTemplateRequest> requests) {
        List<DocTemplate> results = new ArrayList<>(requests.size());
        for (CreateDocTemplateRequest request : requests) {
            results.add(buildTemplate(request));
        }
        return results;
    }

    public DocTemplate getById(Long id) {
        return docTemplateRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + id));
    }

    public Page<DocTemplate> list(String keyword, com.docservice.careerhub.dto.constants.DocType type,
                                  Pageable pageable) {
        return docTemplateRepository.search(keyword, type, pageable);
    }

    private DocTemplate buildTemplate(CreateDocTemplateRequest request) {
        DocTemplate template = newPending(request);
        try {
            byte[] pdf = latexCompiler.compile(request.getLatexCode());
            String url = storageService.upload(pdf, "doc-templates/" + template.getId() + ".pdf", "application/pdf");
            template.setPdfUrl(url);
            template.setStatus(DocTemplateStatus.READY);
            template.setErrorMessage(null);
        } catch (ApiException exception) {
            LOGGER.warn("Template {} ({}) failed to compile: {}", template.getId(), template.getName(),
                    exception.getMessage());
            template.setStatus(DocTemplateStatus.FAILED);
            template.setErrorMessage(truncate(exception.getMessage()));
        }
        return docTemplateRepository.save(template);
    }

    private DocTemplate newPending(CreateDocTemplateRequest request) {
        DocTemplate template = new DocTemplate();
        template.setTemplateCode(request.getTemplateCode());
        template.setName(request.getName());
        template.setType(request.getType());
        template.setDescription(request.getDescription());
        template.setImageUrl(request.getImageUrl());
        template.setLatexCode(request.getLatexCode());
        template.setStatus(DocTemplateStatus.PENDING);
        // Persist first so the id is available for the storage object path.
        return docTemplateRepository.save(template);
    }

    private String truncate(String message) {
        if (message == null) {
            return "Unknown error";
        }
        return message.length() <= MAX_ERROR_LENGTH ? message : message.substring(0, MAX_ERROR_LENGTH);
    }
}
