package com.rentease.modules.user.service;

import com.rentease.common.enums.UserRole;
import com.rentease.exception.EmailAlreadyExistsException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.exception.UnauthorizedException;
import com.rentease.modules.user.dto.UserRequest;
import com.rentease.modules.user.dto.UserResponse;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

import com.rentease.security.CustomUserDetails;
import com.rentease.security.JwtUtil;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserResponse register(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email already registered");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(request.getRole() != null ? UserRole.valueOf(request.getRole()) : UserRole.TENANT)
                .profileImageUrl(request.getProfileImageUrl())
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(new CustomUserDetails(saved), saved.getId());
        return mapToResponse(saved, token);
    }

    public UserResponse login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }
        String token = jwtUtil.generateToken(new CustomUserDetails(user), user.getId());
        return mapToResponse(user, token);
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToResponse(user, null);
    }

    public List<UserResponse> getAllTenants() {
        return userRepository.findByRole(UserRole.TENANT).stream()
                .map(user -> mapToResponse(user, null))
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user, String token) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .createdAt(user.getCreatedAt())
                .token(token)
                .build();
    }
}
