package com.rentease.modules.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    private String fullName;
    private String email;
    private String phone;
    private String profileImageUrl;
    private String bio; // Add bio since it was in Profile.jsx
    private String location; // Add location since it was in Profile.jsx
}
