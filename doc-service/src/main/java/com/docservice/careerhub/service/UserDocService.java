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

import java.util.Objects;

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

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private WatermarkService watermarkService;

    @Transactional
    public UserDoc saveTemplateToAccount(String ownerEmail, Long templateId) {
        DocTemplate template = docTemplateRepository.findById(templateId)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + templateId));
        return findOrCreateForTemplate(ownerEmail, template);
    }

    @Transactional
    public UserDoc openByTemplateCode(String ownerEmail, String templateCode) {
        DocTemplate template = docTemplateRepository.findFirstByTemplateCode(templateCode)
                .orElseThrow(() -> ApiException.notFound("Doc template not found: " + templateCode));
        return findOrCreateForTemplate(ownerEmail, template);
    }

    @Transactional
    public void claim(String ownerEmail, Long id) {
        getOwned(ownerEmail, id);
        if (!entitlementService.unlock(ownerEmail, id)) {
            throw ApiException.paymentRequired("Upgrade your plan to download this resume");
        }
    }

    private UserDoc findOrCreateForTemplate(String ownerEmail, DocTemplate template) {
        if (Objects.nonNull(template.getTemplateCode())) {
            UserDoc existing = userDocRepository
                    .findFirstByOwnerEmailAndTemplateCode(ownerEmail, template.getTemplateCode())
                    .orElse(null);
            if (Objects.nonNull(existing)) {
                return existing;
            }
        }

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
        doc.setStatus(DocTemplateStatus.READY);
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
        return renderAndStore(doc, entitlementService.hasActivePlan(ownerEmail));
    }

    @Transactional
    public byte[] unlockAndCompile(String ownerEmail, Long id) {
        UserDoc doc = getOwned(ownerEmail, id);
        if (!entitlementService.unlock(ownerEmail, id)) {
            throw ApiException.paymentRequired("Upgrade your plan to download this resume");
        }
        return renderAndStore(doc, true);
    }

    private byte[] renderAndStore(UserDoc doc, boolean full) {
        try {
            byte[] compiled = latexCompiler.compile(doc.getLatexCode());
            byte[] output = full ? compiled : watermarkService.buildPreview(compiled);
            String url = storageService.upload(output, "user-docs/" + doc.getId() + ".pdf", "application/pdf");
            doc.setPdfUrl(url);
            doc.setStatus(DocTemplateStatus.READY);
            doc.setErrorMessage(null);
            userDocRepository.save(doc);
            return output;
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
