package com.docservice.careerhub.dto.response;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserDocMetadata {

    private Long id;
    private Long sourceTemplateId;
    private String templateCode;
    private String name;
    private DocType type;
    private String description;
    private DocTemplateStatus status;
    private String pdfUrl;
    private String imageUrl;
    private String errorMessage;
    private boolean unlocked;
    private Instant createdAt;
    private Instant updatedAt;
}
