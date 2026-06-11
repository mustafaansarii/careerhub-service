package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import com.docservice.careerhub.repo.UserDocRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class UserDocService {

    private static final int MAX_ERROR_LENGTH = 2000;

    @Autowired
    private UserDocRepository userDocRepository;

    @Autowired
    private DocTemplateRepository docTemplateRepository;

    @Autowired
    private LatexCompiler latexCompiler;

    @Autowired
    private StorageService storageService;

    @Autowired
    private LatexMergeService latexMergeService;

    @Autowired
    private ResumeDataResolver resumeDataResolver;

    @Transactional
    public UserDoc saveTemplateToAccount(String ownerEmail, Long templateId) {
        DocTemplate template = docTemplateRepository.findById(templateId)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + templateId));

        // The template's latexCode is a Mustache placeholder template — fill it with the user's
        // saved details (or the sample fallback) so the LaTeX editor opens real, compilable LaTeX.
        String merged = latexMergeService.merge(template.getLatexCode(), resumeDataResolver.forUser(ownerEmail));

        UserDoc doc = new UserDoc();
        doc.setOwnerEmail(ownerEmail);
        doc.setSourceTemplateId(template.getId());
        doc.setTemplateCode(template.getTemplateCode());
        doc.setName(template.getName());
        doc.setType(template.getType());
        doc.setDescription(template.getDescription());
        doc.setLatexCode(merged);
        doc.setPdfUrl(template.getPdfUrl());
        doc.setImageUrl(template.getImageUrl());
        doc.setStatus(template.getPdfUrl() != null ? DocTemplateStatus.READY : DocTemplateStatus.PENDING);
        return userDocRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public Page<UserDoc> list(String ownerEmail, String keyword, com.docservice.careerhub.dto.constants.DocType type,
                              Pageable pageable) {
        return userDocRepository.search(ownerEmail, keyword, type, pageable);
    }

    @Transactional(readOnly = true)
    public UserDoc getOwned(String ownerEmail, Long id) {
        return userDocRepository.findByIdAndOwnerEmail(id, ownerEmail)
                .orElseThrow(() -> ApiException.notFound("Doc not found: " + id));
    }


    @Transactional
    public byte[] compileAndUpdate(String ownerEmail, Long id, String latexCode) {
        UserDoc doc = getOwned(ownerEmail, id);
        doc.setLatexCode(latexCode);
        try {
            byte[] pdf = latexCompiler.compile(latexCode);
            String url = storageService.upload(pdf, "user-docs/" + doc.getId() + ".pdf", "application/pdf");
            doc.setPdfUrl(url);
            doc.setStatus(DocTemplateStatus.READY);
            doc.setErrorMessage(null);
            userDocRepository.save(doc);
            return pdf;
        } catch (ApiException exception) {
            doc.setStatus(DocTemplateStatus.FAILED);
            doc.setErrorMessage(truncate(exception.getMessage()));
            userDocRepository.save(doc);
            throw exception;
        }
    }

    private String truncate(String message) {
        if (message == null) {
            return "Unknown error";
        }
        return message.length() <= MAX_ERROR_LENGTH ? message : message.substring(0, MAX_ERROR_LENGTH);
    }
}
