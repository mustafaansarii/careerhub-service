package com.docservice.careerhub.service;

import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.repo.AuthUserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class ResumeDataResolver {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private Map<String, Object> sample = Map.of();

    @PostConstruct
    void loadSample() {
        try (InputStream in = new ClassPathResource("sample-resume.json").getInputStream()) {
            sample = objectMapper.readValue(in, new TypeReference<Map<String, Object>>() { });
        } catch (Exception ignored) {
            sample = Map.of();
        }
    }

    public Map<String, Object> forUser(String email) {
        AuthUser user = email == null ? null : authUserRepository.findByEmail(email).orElse(null);
        if (user != null && user.getProfileData() != null && !user.getProfileData().isBlank()) {
            try {
                Map<String, Object> data = objectMapper.readValue(user.getProfileData(), new TypeReference<Map<String, Object>>() { });
                if (!data.isEmpty()) return data;
            } catch (Exception ignored) {

            }
        }
        return new HashMap<>(sample);
    }
}
