package com.docservice.careerhub.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private static final Logger logger = LoggerFactory.getLogger(CustomOAuth2UserService.class);

    private static final String GITHUB = "github";
    private static final String EMAIL = "email";
    private static final String NAME = "name";

    private final RestClient restClient = RestClient.create();

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauthUser = super.loadUser(userRequest);
        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        Map<String, Object> attributes = new HashMap<>(oauthUser.getAttributes());

        String email = asText(attributes.get(EMAIL));
        if (Objects.isNull(email) && GITHUB.equals(registrationId)) {
            email = fetchGithubPrimaryEmail(userRequest.getAccessToken().getTokenValue());
        }
        if (Objects.isNull(email)) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("email_unavailable"),
                    "No email is available from " + registrationId + " (make it public or grant email scope)");
        }

        String name = asText(attributes.get(NAME));
        if (Objects.isNull(name)) {
            name = asText(attributes.get("login"));
        }
        attributes.put(EMAIL, email);
        attributes.put(NAME, Objects.requireNonNullElse(name, email));
        return new DefaultOAuth2User(oauthUser.getAuthorities(), attributes, EMAIL);
    }

    private String fetchGithubPrimaryEmail(String accessToken) {
        try {
            List<Map<String, Object>> emails = restClient.get()
                    .uri("https://api.github.com/user/emails")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                    .header(HttpHeaders.ACCEPT, "application/vnd.github+json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                    });
            if (Objects.isNull(emails)) {
                return null;
            }
            String firstVerified = null;
            for (Map<String, Object> entry : emails) {
                if (!Boolean.TRUE.equals(entry.get("verified"))) {
                    continue;
                }
                String address = asText(entry.get(EMAIL));
                if (Boolean.TRUE.equals(entry.get("primary"))) {
                    return address;
                }
                if (Objects.isNull(firstVerified)) {
                    firstVerified = address;
                }
            }
            return firstVerified;
        } catch (Exception exception) {
            logger.error("OAuth2 user processing failed", exception);
            return null;
        }
    }

    private String asText(Object value) {
        return value instanceof String text && !text.isBlank() ? text : null;
    }
}
