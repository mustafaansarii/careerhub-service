package com.docservice.careerhub.service;

import com.docservice.careerhub.ai.AiRequest;
import com.docservice.careerhub.ai.AiService;
import com.docservice.careerhub.exception.ApiException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Objects;


@Service
public class ResumeImportService {

    private static final double EXTRACT_TEMPERATURE = 0.2;

    @Autowired
    private AiService aiService;

    @Autowired
    private AuthService authService;

    @Autowired
    private ObjectMapper objectMapper;

    private String profileSchema = "{}";

    @PostConstruct
    void loadProfileSchema() {
        try (InputStream in = new ClassPathResource("sample-resume.json").getInputStream()) {
            profileSchema = new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (Exception ignored) {
            // fall back to the empty schema
        }
    }

    public Map<String, Object> importFromFile(String ownerEmail, MultipartFile file) {
        String resumeText = extractText(file);
        Map<String, Object> profile = parseProfileWithAi(resumeText);
        saveProfile(ownerEmail, profile);
        return profile;
    }

    // ── text extraction ─────────────────────────────────────────────────

    private String extractText(MultipartFile file) {
        if (Objects.isNull(file) || file.isEmpty()) {
            throw ApiException.badData("Please choose a file to upload");
        }
        String fileName = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase();

        String text;
        if (fileName.endsWith(".pdf")) {
            text = extractPdfText(file);
        } else if (fileName.endsWith(".docx")) {
            text = extractDocxText(file);
        } else if (fileName.endsWith(".txt")) {
            text = readBytes(file);
        } else {
            throw ApiException.badData("Unsupported file type. Please upload a PDF or DOCX.");
        }

        if (Objects.isNull(text) || text.isBlank()) {
            throw ApiException.badData("Couldn't read any text from that file. Try a text-based PDF or a DOCX.");
        }
        return text;
    }

    private String extractPdfText(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            return new PDFTextStripper().getText(document);
        } catch (Exception e) {
            throw ApiException.badData("Failed to read the PDF: " + e.getMessage());
        }
    }

    private String extractDocxText(MultipartFile file) {
        try (XWPFDocument document = new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        } catch (Exception e) {
            throw ApiException.badData("Failed to read the DOCX: " + e.getMessage());
        }
    }

    private String readBytes(MultipartFile file) {
        try {
            return new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw ApiException.badData("Failed to read the file: " + e.getMessage());
        }
    }

    // ── AI normalisation ────────────────────────────────────────────────

    private Map<String, Object> parseProfileWithAi(String resumeText) {
        AiRequest request = new AiRequest(buildUserPrompt(resumeText), buildSystemInstruction(), EXTRACT_TEMPERATURE);
        String json = stripCodeFences(aiService.generate(request));
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() { });
        } catch (Exception e) {
            throw ApiException.badData("Could not turn that file into profile data. Please try a clearer resume file.");
        }
    }

    private String buildSystemInstruction() {
        return "You are a precise resume/CV parser. Read the resume text and return ONLY a single JSON object "
                + "(no markdown, no commentary) that matches the given JSON shape EXACTLY — same keys and structure. "
                + "Rules: fix broken, duplicated or misformatted data; if a field is missing, infer a reasonable value "
                + "from context or use an empty string/array; format date periods like 'Jan 2020 - Present'; keep bullets "
                + "concise and ATS-friendly; do NOT invent companies, schools, or skills that the text does not support.";
    }

    private String buildUserPrompt(String resumeText) {
        return "TARGET JSON SHAPE (follow these keys and structure):\n" + profileSchema
                + "\n\nRESUME TEXT:\n" + resumeText;
    }

    private String stripCodeFences(String text) {
        if (Objects.isNull(text)) {
            return "";
        }
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    // ── persistence ─────────────────────────────────────────────────────

    private void saveProfile(String ownerEmail, Map<String, Object> profile) {
        try {
            authService.updateProfile(ownerEmail, objectMapper.writeValueAsString(profile));
        } catch (Exception e) {
            throw new RuntimeException("Failed to save the imported profile", e);
        }
    }
}
