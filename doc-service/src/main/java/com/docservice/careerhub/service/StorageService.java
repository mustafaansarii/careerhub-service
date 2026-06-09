package com.docservice.careerhub.service;

public interface StorageService {

    String upload(byte[] content, String objectPath, String contentType);
}
