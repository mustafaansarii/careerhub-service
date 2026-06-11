package com.docservice.careerhub.dto.response;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DocTemplateMetadata {

    private Long id;
    private String templateCode;
    private String name;
    private DocType type;
    private String description;
    private DocTemplateStatus status;
    private String pdfUrl;
    private String imageUrl;
    private String errorMessage;
    private Instant createdAt;
    private Instant updatedAt;
}
