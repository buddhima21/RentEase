package com.rentease.modules.user.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.user.dto.UserRequest;
import com.rentease.modules.user.dto.UserResponse;
import com.rentease.modules.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody UserRequest request) {
        UserResponse response = userService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserResponse>> login(
            @RequestBody Map<String, String> credentials) {
        UserResponse response = userService.login(
                credentials.get("email"), credentials.get("password"));
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/tenants")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllTenants() {
        List<UserResponse> responses = userService.getAllTenants();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
