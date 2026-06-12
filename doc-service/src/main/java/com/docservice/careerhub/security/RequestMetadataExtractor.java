package com.docservice.careerhub.security;

import com.docservice.careerhub.dto.request.DeviceMetadata;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Objects;

public final class RequestMetadataExtractor {

    private static final String UNKNOWN = "unknown";

    private RequestMetadataExtractor() {
    }

    public static DeviceMetadata extract(HttpServletRequest request) {
        if (Objects.isNull(request)) {
            return new DeviceMetadata(UNKNOWN, UNKNOWN);
        }
        return new DeviceMetadata(userAgent(request), clientIp(request));
    }

    private static String userAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return Objects.isNull(userAgent) || userAgent.isBlank() ? UNKNOWN : userAgent;
    }

    private static String clientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (Objects.nonNull(forwardedFor) && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
