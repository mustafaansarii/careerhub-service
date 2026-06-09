package com.docservice.careerhub.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SaveUserDocRequest {

    @NotNull(message = "templateId is required")
    private Long templateId;
}
