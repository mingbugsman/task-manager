package com.MMM.taskmanager.controller;

import com.MMM.taskmanager.dto.request.contact.ContactMessageRequest;
import com.MMM.taskmanager.dto.response.util.ApiResponse;
import com.MMM.taskmanager.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/v1/contact")
@Tag(name = "Contact", description = "Form liên hệ gửi email tới hỗ trợ")
public class ContactController {

    ContactService contactService;

    @PostMapping("/messages")
    @Operation(summary = "Gửi tin liên hệ", description = "Gửi email tới hòm thư hỗ trợ, Reply-To là email người gửi")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> sendMessage(
            @RequestBody @Valid ContactMessageRequest request) {
        contactService.submitContactMessage(request);
        return ResponseEntity.ok(
                ApiResponse.of(Map.of("sent", true), "Đã gửi tin tới hòm thư hỗ trợ. Chúng tôi sẽ phản hồi qua email bạn đã nhập.")
        );
    }
}
