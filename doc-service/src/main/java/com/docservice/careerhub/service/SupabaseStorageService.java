package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;


@Service
public class SupabaseStorageService implements StorageService {

    private final RestClient restClient = RestClient.create();

    @Autowired
    private AppProperties appProperties;

    @Override
    public String upload(byte[] content, String objectPath, String contentType) {
        String bucket = appProperties.getSupabaseBucketName();
        String base = trimTrailingSlash(appProperties.getSupabaseUrl());
        String uploadUrl = base + "/storage/v1/object/" + bucket + "/" + objectPath;
        try {
            restClient.post()
                    .uri(uploadUrl)
                    .header("Authorization", "Bearer " + appProperties.getSupabaseServiceKey())
                    .header("x-upsert", "true")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(content)
                    .retrieve()
                    .toBodilessEntity();
        } catch (RestClientException exception) {
            throw ApiException.badData("Failed to upload PDF to storage: " + exception.getMessage());
        }
        return base + "/storage/v1/object/public/" + bucket + "/" + objectPath;
    }

    private String trimTrailingSlash(String url) {
        return url != null && url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
