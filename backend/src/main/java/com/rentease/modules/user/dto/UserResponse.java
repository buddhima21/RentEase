package com.rentease.modules.user.dto;

import com.rentease.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role;
    private String profileImageUrl;
    private String bio;
    private String location;
    private LocalDateTime createdAt;
    private String token;
}
