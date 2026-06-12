package com.docservice.careerhub.controller;

import com.docservice.careerhub.service.ResumeImportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ResumeController {

    @Autowired
    private ResumeImportService resumeImportService;

    @PostMapping(value = "/import-resume", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> importResume(Authentication authentication, @RequestParam("file") MultipartFile file) {
        return resumeImportService.importFromFile(authentication.getName(), file);
    }
}
