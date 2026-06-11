package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.dto.request.PageQuery;
import com.docservice.careerhub.dto.response.DocTemplateMetadata;
import com.docservice.careerhub.dto.response.PageResponse;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.service.DocTemplateService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import com.docservice.careerhub.util.PageUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
public class DocTemplateDtoApi extends AbstractDtoUtil {

    private static final int MAX_BATCH = 50;
    private static final String DEFAULT_SORT = "createdAt";

    @Autowired
    private DocTemplateService docTemplateService;

    public List<DocTemplateMetadata> create(List<CreateDocTemplateRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw ApiException.badData("At least one template is required");
        }
        if (requests.size() > MAX_BATCH) {
            throw ApiException.badData("At most " + MAX_BATCH + " templates can be uploaded at once");
        }
        requests.forEach(AbstractDtoUtil::validate);
        return docTemplateService.createAll(requests).stream()
                .map(this::toMetadata)
                .toList();
    }

    public DocTemplateMetadata getMetadata(Long id) {
        return toMetadata(docTemplateService.getById(id));
    }

    public PageResponse<DocTemplateMetadata> listMetadata(PageQuery query,
                                                          com.docservice.careerhub.dto.constants.DocType type) {
        Pageable pageable = PageUtil.toPageable(query, DEFAULT_SORT);
        Page<DocTemplate> result = docTemplateService.list(query.getKeyword(), type, pageable);
        List<DocTemplateMetadata> content = result.getContent().stream().map(this::toMetadata).toList();
        return PageUtil.toResponse(result, content);
    }

    // ── private helpers ─────────────────────────────────────────────────

    private DocTemplateMetadata toMetadata(DocTemplate template) {
        return DocTemplateMetadata.builder()
                .id(template.getId())
                .templateCode(template.getTemplateCode())
                .name(template.getName())
                .type(template.getType())
                .description(template.getDescription())
                .status(template.getStatus())
                .pdfUrl(template.getPdfUrl())
                .imageUrl(template.getImageUrl())
                .errorMessage(template.getErrorMessage())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
}
