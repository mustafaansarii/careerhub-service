package com.docservice.careerhub.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Component
public class RoleEndpointAccessLoader {

    private static final Logger logger = LoggerFactory.getLogger(RoleEndpointAccessLoader.class);

    private static final String CSV_PATH = "user-roles.csv";
    private static final String HEADER_PREFIX = "method,";

    public record AccessRule(HttpMethod method, String pattern, String[] roles) {
    }

    private final List<AccessRule> rules = new ArrayList<>();

    @PostConstruct
    void load() {
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(new ClassPathResource(CSV_PATH).getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#") || line.startsWith(HEADER_PREFIX)) {
                    continue;
                }
                String[] columns = line.split(",", 3);
                if (columns.length < 3) {
                    continue;
                }
                HttpMethod method = HttpMethod.valueOf(columns[0].trim().toUpperCase());
                String pattern = columns[1].trim();
                String[] roles = parseRoles(columns[2]);
                rules.add(new AccessRule(method, pattern, roles));
            }
        } catch (Exception exception) {
            logger.error("Failed to load access rules from {}", CSV_PATH, exception);
            throw new IllegalStateException("Failed to load access rules from " + CSV_PATH, exception);
        }
    }

    public List<AccessRule> getRules() {
        return rules;
    }

    private static String[] parseRoles(String raw) {
        return java.util.Arrays.stream(raw.split("\\|"))
                .map(String::trim)
                .filter(role -> !role.isEmpty())
                .toArray(String[]::new);
    }
}
