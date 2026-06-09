package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.CompileDocRequest;
import com.docservice.careerhub.dto.request.PageQuery;
import com.docservice.careerhub.dto.request.SaveUserDocRequest;
import com.docservice.careerhub.dto.response.PageResponse;
import com.docservice.careerhub.dto.response.UserDocMetadata;
import com.docservice.careerhub.dto.response.UserDocResponse;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.service.UserDocService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import com.docservice.careerhub.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Orchestration for a user's saved documents: validates forms, delegates to the service, and maps
 * entities to the metadata (no LaTeX) and full (with LaTeX) response shapes. Ownership (email) is
 * supplied by the controller from the authenticated principal.
 */
@Component
public class UserDocDtoApi extends AbstractDtoUtil {

    private static final String DEFAULT_SORT = "updatedAt";

    @Autowired
    private UserDocService userDocService;

    public UserDocResponse save(String ownerEmail, SaveUserDocRequest request) {
        validate(request);
        return toResponse(userDocService.saveTemplateToAccount(ownerEmail, request.getTemplateId()));
    }

    public PageResponse<UserDocMetadata> list(String ownerEmail, PageQuery query, DocType type) {
        Pageable pageable = PageUtil.toPageable(query, DEFAULT_SORT);
        Page<UserDoc> result = userDocService.list(ownerEmail, query.getKeyword(), type, pageable);
        List<UserDocMetadata> content = result.getContent().stream().map(this::toMetadata).toList();
        return PageUtil.toResponse(result, content);
    }

    public UserDocResponse get(String ownerEmail, Long id) {
        return toResponse(userDocService.getOwned(ownerEmail, id));
    }

    /** Persists new LaTeX, recompiles, updates the stored PDF, and returns the rendered PDF bytes. */
    public byte[] compileAndUpdate(String ownerEmail, Long id, CompileDocRequest request) {
        validate(request);
        return userDocService.compileAndUpdate(ownerEmail, id, request.getLatexCode());
    }

    // ── private helpers ─────────────────────────────────────────────────

    private UserDocMetadata toMetadata(UserDoc doc) {
        return UserDocMetadata.builder()
                .id(doc.getId())
                .sourceTemplateId(doc.getSourceTemplateId())
                .name(doc.getName())
                .type(doc.getType())
                .description(doc.getDescription())
                .status(doc.getStatus())
                .pdfUrl(doc.getPdfUrl())
                .imageUrl(doc.getImageUrl())
                .errorMessage(doc.getErrorMessage())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }

    private UserDocResponse toResponse(UserDoc doc) {
        return UserDocResponse.builder()
                .id(doc.getId())
                .sourceTemplateId(doc.getSourceTemplateId())
                .name(doc.getName())
                .type(doc.getType())
                .description(doc.getDescription())
                .latexCode(doc.getLatexCode())
                .status(doc.getStatus())
                .pdfUrl(doc.getPdfUrl())
                .imageUrl(doc.getImageUrl())
                .errorMessage(doc.getErrorMessage())
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }
}
