package com.docservice.careerhub.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private static final Logger logger = LoggerFactory.getLogger(AiService.class);

    @Value("${openai.apiKey:}")
    private String apiKey;

    @Value("${openai.modelName:gemini-flash-latest}")
    private String modelName;

    public String generate(String prompt) {
        return generate(new AiRequest(prompt, null, null));
    }

    public String generate(AiRequest request) {
        if (request == null || request.prompt() == null || request.prompt().isBlank()) {
            throw new AiException("prompt is required");
        }
        Map<String, Object> data;
        try {
            data = callModel(buildPayload(request));
        } catch (AiException e) {
            throw e;
        } catch (Exception ex) {
            logger.error("AI API request failed: {}", ex.getMessage(), ex);
            throw new AiException("An error occurred while communicating with the AI service", ex);
        }
        try {
            return extractText(data);
        } catch (Exception e) {
            logger.error("Failed to parse the AI response: {}", e.getMessage(), e);
            throw new AiException("Could not parse the AI response", e);
        }
    }

    private Map<String, Object> callModel(Map<String, Object> payload) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new AiException("openai.apiKey is not configured");
        }
        if (modelName == null || modelName.isBlank()) {
            throw new AiException("openai.modelName is not configured");
        }
        String url = String.format(
                "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, apiKey);
        Map<String, Object> body = RestClient.create().post()
                .uri(url)
                .header("Content-Type", "application/json")
                .body(payload)
                .retrieve()
                .body(Map.class);
        if (body == null) {
            throw new AiException("Empty response from the AI service");
        }
        return body;
    }

    private String extractText(Map<String, Object> data) {
        List<?> candidates = asList(data.get("candidates"));
        if (candidates == null || candidates.isEmpty()) {
            throw new AiException("No candidates in AI response");
        }
        Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
        Map<?, ?> content = (Map<?, ?>) candidate.get("content");
        List<?> parts = content == null ? null : asList(content.get("parts"));
        if (parts == null || parts.isEmpty()) {
            throw new AiException("No content parts in AI response");
        }
        Object text = ((Map<?, ?>) parts.get(0)).get("text");
        if (text == null) {
            throw new AiException("No text in AI completion");
        }
        return text.toString().trim();
    }

    private static List<?> asList(Object o) {
        return o instanceof List<?> list ? list : null;
    }

    private Map<String, Object> buildPayload(AiRequest request) {
        Map<String, Object> userText = new HashMap<>();
        userText.put("text", request.prompt());
        Map<String, Object> userContent = new HashMap<>();
        userContent.put("parts", new Object[]{userText});

        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", new Object[]{userContent});

        if (request.system() != null && !request.system().isBlank()) {
            Map<String, Object> systemParts = new HashMap<>();
            systemParts.put("text", request.system());
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", systemParts);
            payload.put("system_instruction", systemInstruction);
        }
        if (request.temperature() != null) {
            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("temperature", request.temperature());
            payload.put("generationConfig", generationConfig);
        }
        return payload;
    }
}
