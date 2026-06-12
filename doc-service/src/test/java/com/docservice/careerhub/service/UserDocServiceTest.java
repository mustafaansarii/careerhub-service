package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.entity.DocTemplate;
import com.docservice.careerhub.entity.UserDoc;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.repo.DocTemplateRepository;
import com.docservice.careerhub.repo.UserDocRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class UserDocServiceTest {

    private UserDocRepository userDocRepo;
    private DocTemplateRepository templateRepo;
    private LatexCompiler compiler;
    private StorageService storage;
    private LatexMergeService mergeService;
    private ResumeDataResolver resolver;
    private EntitlementService entitlementService;
    private WatermarkService watermarkService;
    private UserDocService service;

    @BeforeEach
    void setUp() {
        userDocRepo = mock(UserDocRepository.class);
        templateRepo = mock(DocTemplateRepository.class);
        compiler = mock(LatexCompiler.class);
        storage = mock(StorageService.class);
        mergeService = mock(LatexMergeService.class);
        resolver = mock(ResumeDataResolver.class);
        entitlementService = mock(EntitlementService.class);
        watermarkService = mock(WatermarkService.class);
        service = new UserDocService();
        ReflectionTestUtils.setField(service, "userDocRepository", userDocRepo);
        ReflectionTestUtils.setField(service, "docTemplateRepository", templateRepo);
        ReflectionTestUtils.setField(service, "latexCompiler", compiler);
        ReflectionTestUtils.setField(service, "storageService", storage);
        ReflectionTestUtils.setField(service, "latexMergeService", mergeService);
        ReflectionTestUtils.setField(service, "resumeDataResolver", resolver);
        ReflectionTestUtils.setField(service, "entitlementService", entitlementService);
        ReflectionTestUtils.setField(service, "watermarkService", watermarkService);
        when(resolver.forUser(anyString())).thenReturn(java.util.Map.of());
        when(mergeService.merge(anyString(), any())).thenAnswer(inv -> inv.getArgument(0));
        when(entitlementService.hasActivePlan(anyString())).thenReturn(true);
        when(watermarkService.buildPreview(any())).thenAnswer(inv -> inv.getArgument(0));
        when(userDocRepo.save(any(UserDoc.class))).thenAnswer(inv -> {
            UserDoc d = inv.getArgument(0);
            if (d.getId() == null) {
                d.setId(100L);
            }
            return d;
        });
    }

    private DocTemplate template() {
        DocTemplate t = new DocTemplate();
        t.setId(5L);
        t.setName("Resume");
        t.setType(DocType.CV_AND_RESUME);
        t.setDescription("a resume");
        t.setLatexCode("\\documentclass{article}\\begin{document}hi\\end{document}");
        t.setPdfUrl("https://store/doc-templates/5.pdf");
        t.setStatus(DocTemplateStatus.READY);
        return t;
    }

    private UserDoc ownedDoc() {
        UserDoc doc = new UserDoc();
        doc.setId(100L);
        doc.setOwnerEmail("user@example.com");
        doc.setName("Resume");
        doc.setType(DocType.CV_AND_RESUME);
        doc.setLatexCode("old");
        doc.setStatus(DocTemplateStatus.READY);
        return doc;
    }

    @Test
    void saveTemplateCopiesIntoAccount() {
        when(templateRepo.findById(5L)).thenReturn(Optional.of(template()));

        UserDoc saved = service.saveTemplateToAccount("user@example.com", 5L);

        assertThat(saved.getOwnerEmail()).isEqualTo("user@example.com");
        assertThat(saved.getSourceTemplateId()).isEqualTo(5L);
        assertThat(saved.getName()).isEqualTo("Resume");
        assertThat(saved.getLatexCode()).contains("documentclass");
        assertThat(saved.getPdfUrl()).isEqualTo("https://store/doc-templates/5.pdf");
        assertThat(saved.getStatus()).isEqualTo(DocTemplateStatus.READY);
    }

    @Test
    void saveTemplateRejectsMissingTemplate() {
        when(templateRepo.findById(9L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.saveTemplateToAccount("user@example.com", 9L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void compileAndUpdatePersistsCompilesUploadsAndReturnsPdf() {
        when(userDocRepo.findByIdAndOwnerEmail(100L, "user@example.com")).thenReturn(Optional.of(ownedDoc()));
        when(compiler.compile("new latex")).thenReturn(new byte[]{9, 9});
        when(storage.upload(any(), eq("user-docs/100.pdf"), eq("application/pdf"))).thenReturn("https://store/user-docs/100.pdf");

        byte[] pdf = service.compileAndUpdate("user@example.com", 100L, "new latex");

        assertThat(pdf).containsExactly(9, 9);
        verify(storage).upload(any(), eq("user-docs/100.pdf"), eq("application/pdf"));
    }

    @Test
    void compileAndUpdateMarksFailedAndRethrowsOnCompileError() {
        UserDoc doc = ownedDoc();
        when(userDocRepo.findByIdAndOwnerEmail(100L, "user@example.com")).thenReturn(Optional.of(doc));
        when(compiler.compile(anyString())).thenThrow(ApiException.badData("LaTeX compilation error"));

        assertThatThrownBy(() -> service.compileAndUpdate("user@example.com", 100L, "bad"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("compilation");
        assertThat(doc.getStatus()).isEqualTo(DocTemplateStatus.FAILED);
        assertThat(doc.getLatexCode()).isEqualTo("bad");
        verify(storage, never()).upload(any(), anyString(), anyString());
    }

    @Test
    void getOwnedRejectsWhenNotOwnedOrMissing() {
        when(userDocRepo.findByIdAndOwnerEmail(100L, "user@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getOwned("user@example.com", 100L))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("not found");
    }
}
