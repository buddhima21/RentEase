package com.rentease.modules.user.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.user.dto.UserRequest;
import com.rentease.modules.user.dto.UserResponse;
import com.rentease.modules.user.service.UserService;
import com.rentease.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @PostMapping("/technicians")
    public ResponseEntity<ApiResponse<UserResponse>> createTechnician(
            @Valid @RequestBody UserRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        UserResponse response = userService.createTechnicianByAdmin(request, userDetails.getId());
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Technician account created successfully"));
    }
}
