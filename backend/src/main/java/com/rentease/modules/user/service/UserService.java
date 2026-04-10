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

import com.rentease.security.CustomUserDetails;
import com.rentease.security.JwtUtil;
import com.rentease.modules.agreement.repository.AgreementRepository;
import com.rentease.modules.agreement.model.Agreement;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.user.dto.TenantPropertyResponse;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AgreementRepository agreementRepository;
    private final PropertyRepository propertyRepository;

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

    public UserResponse updateUser(String id, com.rentease.modules.user.dto.UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        
        if(request.getFullName() != null) user.setFullName(request.getFullName());
        if(request.getPhone() != null) user.setPhone(request.getPhone());
        if(request.getProfileImageUrl() != null) user.setProfileImageUrl(request.getProfileImageUrl());
        if(request.getBio() != null) user.setBio(request.getBio());
        if(request.getLocation() != null) user.setLocation(request.getLocation());
        
        if(user.getRole() == null) {
            user.setRole(UserRole.TENANT);
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated, jwtUtil.generateToken(new CustomUserDetails(updated), updated.getId()));
    }

    public java.util.List<TenantPropertyResponse> getTenants(String ownerId) {
        if (ownerId != null && !ownerId.isEmpty()) {
            return agreementRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId)
                    .stream()
                    .filter(agreement -> agreement.getStatus() == com.rentease.common.enums.AgreementStatus.ACTIVE)
                    .map(agreement -> {
                        User tenant = userRepository.findById(agreement.getTenantId()).orElse(null);
                        Property property = propertyRepository.findById(agreement.getPropertyId()).orElse(null);
                        
                        return TenantPropertyResponse.builder()
                                .tenantId(agreement.getTenantId())
                                .tenantName(tenant != null ? tenant.getFullName() : "Unknown Tenant")
                                .tenantEmail(tenant != null ? tenant.getEmail() : "")
                                .propertyId(agreement.getPropertyId())
                                .propertyTitle(property != null ? property.getTitle() : "Unknown Property")
                                .rentalFee(agreement.getRentAmount())
                                .build();
                    })
                    .collect(java.util.stream.Collectors.toList());
        }

        // Default for admin/others (if needed, though currently Owner orientated)
        return userRepository.findByRole(UserRole.TENANT).stream()
                .map(u -> TenantPropertyResponse.builder()
                        .tenantId(u.getId())
                        .tenantName(u.getFullName())
                        .tenantEmail(u.getEmail())
                        .rentalFee(20000) // Fallback or logic to find their agreement
                        .build())
                .collect(java.util.stream.Collectors.toList());
    }

    private UserResponse mapToResponse(User user, String token) {
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .bio(user.getBio())
                .location(user.getLocation())
                .createdAt(user.getCreatedAt())
                .token(token)
                .build();
    }
}
