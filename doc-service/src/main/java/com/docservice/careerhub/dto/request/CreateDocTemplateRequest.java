package com.docservice.careerhub.dto.request;

import com.docservice.careerhub.dto.constants.DocType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateDocTemplateRequest {

    @NotBlank(message = "name is required")
    private String name;

    @NotNull(message = "type is required")
    private DocType type;

    @Size(max = 1000, message = "description must be at most 1000 characters")
    private String description;

    /** Optional preview/thumbnail image URL. */
    private String imageUrl;

    @NotBlank(message = "latexCode is required")
    private String latexCode;
}
