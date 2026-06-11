package com.docservice.careerhub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class LatexMergeServiceTest {

    private final LatexMergeService service = new LatexMergeService();

    @Test
    void escapesLatexSpecialCharacters() {
        String out = service.merge("{{ name }}", Map.of("name", "A & B_ 50% #1"));
        assertThat(out).isEqualTo("A \\& B\\_ 50\\% \\#1");
    }

    @Test
    void mergesSampleDataWithNoLeftoverPlaceholders() throws Exception {
        ObjectMapper om = new ObjectMapper();
        Map<String, Object> data;
        try (var in = new ClassPathResource("sample-resume.json").getInputStream()) {
            data = om.readValue(in, new TypeReference<Map<String, Object>>() { });
        }
        String template = "{\\Huge {{ name }}}\n"
                + "{{#hasExperience}}\\section{Experience}{{#experience}}"
                + "\\textbf{ {{ company }} } {{ period }}\\begin{itemize}{{#bullets}}\\item {{ . }}{{/bullets}}\\end{itemize}"
                + "{{/experience}}{{/hasExperience}}"
                + "{{#hasSkills}}\\section{Skills}{{#skills}}\\textbf{ {{ label }}:} {{ value }}{{/skills}}{{/hasSkills}}";

        String out = service.merge(template, data);

        assertThat(out)
                .contains("Willim Lucas")
                .contains("Nexus info")
                .contains("Languages:")
                .doesNotContain("{{")
                .doesNotContain("}}");
    }

    @Test
    void emptyListHidesSection() {
        String out = service.merge("{{#hasExperience}}SHOWN{{/hasExperience}}DONE", Map.of("experience", java.util.List.of()));
        assertThat(out).isEqualTo("DONE");
    }
}
