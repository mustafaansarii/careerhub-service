package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.request.CompileDocRequest;
import com.docservice.careerhub.dto.request.PageQuery;
import com.docservice.careerhub.dto.request.SaveUserDocRequest;
import com.docservice.careerhub.dto.response.PageResponse;
import com.docservice.careerhub.dto.response.UserDocMetadata;
import com.docservice.careerhub.dto.response.UserDocResponse;
import com.docservice.careerhub.dtoApi.UserDocDtoApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user-docs")
public class UserDocController {

    @Autowired
    private UserDocDtoApi userDocDtoApi;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDocResponse save(Authentication authentication, @RequestBody SaveUserDocRequest request) {
        return userDocDtoApi.save(authentication.getName(), request);
    }

    @GetMapping
    public PageResponse<UserDocMetadata> list(Authentication authentication, PageQuery query,
                                              @RequestParam(required = false) DocType type) {
        return userDocDtoApi.list(authentication.getName(), query, type);
    }

    @GetMapping("/{id}")
    public UserDocResponse get(Authentication authentication, @PathVariable Long id) {
        return userDocDtoApi.get(authentication.getName(), id);
    }

    @PatchMapping(value = "/{id}/compile", produces = MediaType.APPLICATION_PDF_VALUE)
    public byte[] compile(Authentication authentication, @PathVariable Long id,
                          @RequestBody CompileDocRequest request) {
        return userDocDtoApi.compileAndUpdate(authentication.getName(), id, request);
    }

    @PostMapping(value = "/{id}/unlock", produces = MediaType.APPLICATION_PDF_VALUE)
    public byte[] unlock(Authentication authentication, @PathVariable Long id) {
        return userDocDtoApi.unlock(authentication.getName(), id);
    }
}
