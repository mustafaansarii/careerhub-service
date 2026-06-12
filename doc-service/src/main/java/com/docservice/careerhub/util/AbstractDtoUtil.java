package com.docservice.careerhub.util;

import com.docservice.careerhub.exception.ApiException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public abstract class AbstractDtoUtil {

    private static final Validator VALIDATOR = Validation.buildDefaultValidatorFactory().getValidator();

    protected static <T> void validate(T form) {
        if (Objects.isNull(form)) {
            throw ApiException.badData("Request body is required");
        }
        Set<ConstraintViolation<T>> violations = VALIDATOR.validate(form);
        if (!violations.isEmpty()) {
            String message = violations.stream()
                    .map(violation -> violation.getPropertyPath() + ": " + violation.getMessage())
                    .collect(Collectors.joining("; "));
            throw ApiException.badData(message);
        }
    }
}
