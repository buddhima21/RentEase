package com.rentease.config;

import com.rentease.common.enums.UserRole;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminDataSeeder {

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String adminEmail = "admin@rentease.com";
            if (!userRepository.existsByEmail(adminEmail)) {
                User adminUser = User.builder()
                        .fullName("System Administrator")
                        .email(adminEmail)
                        .password(passwordEncoder.encode("Admin123"))
                        .phone("0000000000")
                        .role(UserRole.ADMIN)
                        .build();

                userRepository.save(adminUser);
                System.out.println("====== Default Admin User Created ======");
                System.out.println("Email: " + adminEmail);
                System.out.println("Role: ADMIN");
                System.out.println("========================================");
            } else {
                System.out.println("====== Default Admin User Already Exists ======");
            }
        };
    }
}
