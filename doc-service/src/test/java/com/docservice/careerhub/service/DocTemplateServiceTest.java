package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.CreateDocTemplateRequest;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DocTemplateServiceTest {

    private DocTemplateRepository repo;
    private LatexCompiler compiler;
    private StorageService storage;
    private DocTemplateService service;

    @BeforeEach
    void setUp() {
        repo = mock(DocTemplateRepository.class);
        compiler = mock(LatexCompiler.class);
        storage = mock(StorageService.class);
        service = new DocTemplateService();
        ReflectionTestUtils.setField(service, "docTemplateRepository", repo);
        ReflectionTestUtils.setField(service, "latexCompiler", compiler);
        ReflectionTestUtils.setField(service, "storageService", storage);

        AtomicLong ids = new AtomicLong(0);
        when(repo.save(any(DocTemplate.class))).thenAnswer(inv -> {
            DocTemplate t = inv.getArgument(0);
            if (t.getId() == null) {
                t.setId(ids.incrementAndGet());
            }
            return t;
        });
    }

    private CreateDocTemplateRequest request(String name) {
        CreateDocTemplateRequest request = new CreateDocTemplateRequest();
        request.setName(name);
        request.setType(DocType.CV_AND_RESUME);
        request.setDescription("a " + name);
        request.setLatexCode("\\documentclass{article}\\begin{document}hi\\end{document}");
        return request;
    }

    @Test
    void createCompilesUploadsAndMarksReady() {
        when(compiler.compile(anyString())).thenReturn(new byte[]{1, 2, 3});
        when(storage.upload(any(), anyString(), eq("application/pdf"))).thenReturn("https://store/doc-templates/1.pdf");

        List<DocTemplate> result = service.createAll(List.of(request("resume")));

        assertThat(result).hasSize(1);
        DocTemplate template = result.get(0);
        assertThat(template.getStatus()).isEqualTo(DocTemplateStatus.READY);
        assertThat(template.getPdfUrl()).isEqualTo("https://store/doc-templates/1.pdf");
        assertThat(template.getErrorMessage()).isNull();

        verify(storage).upload(any(), eq("doc-templates/1.pdf"), eq("application/pdf"));
    }

    @Test
    void createMarksFailedWhenCompilationFailsAndDoesNotUpload() {
        when(compiler.compile(anyString())).thenThrow(ApiException.badData("LaTeX compilation error"));

        List<DocTemplate> result = service.createAll(List.of(request("broken")));

        DocTemplate template = result.get(0);
        assertThat(template.getStatus()).isEqualTo(DocTemplateStatus.FAILED);
        assertThat(template.getPdfUrl()).isNull();
        assertThat(template.getErrorMessage()).contains("LaTeX compilation error");
        verify(storage, never()).upload(any(), anyString(), anyString());
    }

    @Test
    void createIsolatesFailuresAcrossBatch() {
        when(compiler.compile(anyString()))
                .thenReturn(new byte[]{1})
                .thenThrow(ApiException.badData("boom"));
        when(storage.upload(any(), anyString(), anyString())).thenReturn("https://store/x.pdf");

        List<DocTemplate> result = service.createAll(List.of(request("ok"), request("bad")));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getStatus()).isEqualTo(DocTemplateStatus.READY);
        assertThat(result.get(1).getStatus()).isEqualTo(DocTemplateStatus.FAILED);
    }

    @Test
    void getByIdThrowsWhenMissing() {
        when(repo.findById(99L)).thenReturn(java.util.Optional.empty());

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> service.getById(99L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }
}
