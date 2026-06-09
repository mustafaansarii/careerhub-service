package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class MailService {

    private static final Logger LOGGER = LoggerFactory.getLogger(MailService.class);
    private static final String OTP_SUBJECT = "Your verification code";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private AppProperties appProperties;

    public void sendOtp(String toEmail, String otp) {
        String body = "Your verification code is " + otp + ". It expires in 5 minutes.";
        String fromAddress = appProperties.getMailFrom();
        if (Objects.isNull(mailSender) || Objects.isNull(fromAddress) || fromAddress.isBlank()) {
            LOGGER.warn("Mail not configured — OTP for {} is {}", toEmail, otp);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject(OTP_SUBJECT);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception exception) {
            LOGGER.error("Failed to send OTP email to {}", toEmail, exception);
            LOGGER.warn("OTP for {} is {}", toEmail, otp);
        }
    }
}
