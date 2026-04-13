package com.rentease.config;

import com.rentease.common.enums.*;
import com.rentease.modules.booking.model.Booking;
import com.rentease.modules.booking.repository.BookingRepository;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.maintenance.repository.MaintenanceRepository;
import com.rentease.modules.payment.model.Payment;
import com.rentease.modules.payment.repository.PaymentRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.review.model.Review;
import com.rentease.modules.review.repository.ReviewRepository;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class DemoDataSeeder {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initDemoData() {
        return args -> {
            boolean shouldSeed = !userRepository.existsByEmail("tenant@gmail.com") 
                                 || userRepository.findByEmail("tenant@gmail.com").get().getFullName() == null;
            
            // Force seed if tenant@gmail.com password hash isn't correct from this script
            // For simplicity, we just wipe old data and seed fresh if owner@gmail.com is missing
            if (!userRepository.existsByEmail("owner@gmail.com")) {
                System.out.println("====== Cleared Old Data & Seeding Realistic Demo Data ======");
                
                propertyRepository.deleteAll();
                bookingRepository.deleteAll();
                paymentRepository.deleteAll();
                reviewRepository.deleteAll();
                maintenanceRepository.deleteAll();
                
                // Delete all users except admin
                userRepository.findAll().forEach(u -> {
                    if (u.getRole() != UserRole.ADMIN) {
                        userRepository.delete(u);
                    }
                });

                // Users
                User owner = User.builder()
                        .fullName("Nirosha Jayasinghe")
                        .email("owner@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .phone("0771234567")
                        .role(UserRole.OWNER)
                        .bio("Property owner with 5 years of experience in the Sri Lankan rental market.")
                        .location("Colombo")
                        .build();
                userRepository.save(owner);

                User tenant = User.builder()
                        .fullName("Amali Fernando")
                        .email("tenant@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .phone("0719876543")
                        .role(UserRole.TENANT)
                        .bio("Looking for quality housing in Colombo.")
                        .location("Colombo")
                        .build();
                userRepository.save(tenant);

                // Add 1 more owner to get realistic data
                User owner2 = User.builder()
                        .fullName("Kamal Perera")
                        .email("kamal.perera@gmail.com")
                        .password(passwordEncoder.encode("password"))
                        .phone("0779998888")
                        .role(UserRole.OWNER)
                        .bio("Real estate investor in Kandy & Colombo.")
                        .location("Kandy")
                        .build();
                userRepository.save(owner2);

                System.out.println("====== Seeded Users: tenant@gmail.com | owner@gmail.com (Password: password) ======");

                // Properties
                Property prop1 = Property.builder()
                        .title("Spacious 3BR Apartment – Colombo 07")
                        .description("A bright, modern apartment in the heart of Colombo 07. Close to schools, hospitals, and shopping malls. 24/7 security and backup generator included.")
                        .address("45/2, Flower Road, Colombo 07")
                        .city("Colombo")
                        .price(95000)
                        .securityDeposit(190000)
                        .bedrooms(3)
                        .bathrooms(2)
                        .area(1450)
                        .propertyType("Apartment")
                        .amenities(List.of("WiFi", "Air Conditioning", "Parking", "Generator", "Security"))
                        .imageUrls(List.of("https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"))
                        .ownerId(owner.getId())
                        .ownerName(owner.getFullName())
                        .ownerEmail(owner.getEmail())
                        .status(PropertyStatus.APPROVED)
                        .termsAndConditions("No pets allowed. No smoking indoors.")
                        .build();
                propertyRepository.save(prop1);

                Property prop2 = Property.builder()
                        .title("Cozy Studio – Nugegoda")
                        .description("Perfect studio apartment for a working professional. Fully furnished with a modern kitchen and fast fiber internet.")
                        .address("12, High Level Road, Nugegoda")
                        .city("Colombo")
                        .price(35000)
                        .securityDeposit(70000)
                        .bedrooms(1)
                        .bathrooms(1)
                        .area(480)
                        .propertyType("Studio")
                        .amenities(List.of("WiFi", "Furnished", "Air Conditioning"))
                        .imageUrls(List.of("https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"))
                        .ownerId(owner.getId())
                        .ownerName(owner.getFullName())
                        .ownerEmail(owner.getEmail())
                        .status(PropertyStatus.RENTED)
                        .termsAndConditions("Security deposit refundable on vacating.")
                        .build();
                propertyRepository.save(prop2);

                Property prop3 = Property.builder()
                        .title("Luxury 4BR House – Kandana")
                        .description("Elegant family home with large garden, modern kitchen and solar power setup. Quiet neighbourhood, near Kandana town.")
                        .address("78, Negombo Road, Kandana")
                        .city("Gampaha")
                        .price(120000)
                        .securityDeposit(240000)
                        .bedrooms(4)
                        .bathrooms(3)
                        .area(2200)
                        .propertyType("House")
                        .amenities(List.of("Garden", "Solar Power", "Parking", "CCTV", "Water Well"))
                        .imageUrls(List.of("https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800"))
                        .ownerId(owner2.getId())
                        .ownerName(owner2.getFullName())
                        .ownerEmail(owner2.getEmail())
                        .status(PropertyStatus.APPROVED)
                        .termsAndConditions("Rent due by 5th of each month.")
                        .build();
                propertyRepository.save(prop3);

                // Bookings
                Booking booking = Booking.builder()
                        .propertyId(prop2.getId())
                        .tenantId(tenant.getId())
                        .ownerId(owner.getId())
                        .startDate(LocalDate.now().minusMonths(3))
                        .endDate(LocalDate.now().plusMonths(9))
                        .monthlyRent(35000)
                        .status(BookingStatus.CONFIRMED)
                        .createdAt(LocalDateTime.now().minusMonths(3))
                        .build();
                bookingRepository.save(booking);

                // Payments
                Payment payment1 = Payment.builder()
                        .bookingId(booking.getId())
                        .tenantId(tenant.getId())
                        .ownerId(owner.getId())
                        .amount(35000)
                        .dueDate(LocalDate.now().minusMonths(1))
                        .paidDate(LocalDate.now().minusMonths(1))
                        .status(PaymentStatus.COMPLETED)
                        .createdAt(LocalDateTime.now().minusMonths(1))
                        .build();
                paymentRepository.save(payment1);
                
                Payment payment2 = Payment.builder()
                        .bookingId(booking.getId())
                        .tenantId(tenant.getId())
                        .ownerId(owner.getId())
                        .amount(35000)
                        .dueDate(LocalDate.now().plusDays(5))
                        .status(PaymentStatus.PENDING)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build();
                paymentRepository.save(payment2);

                // Reviews
                Review review1 = Review.builder()
                        .propertyId(prop1.getId())
                        .reviewerId(tenant.getId())
                        .rating(5)
                        .comment("Absolutely loved staying here! The apartment is exactly as described – spacious, well-lit, and spotlessly clean. The 24/7 security gave us great peace of mind. Nirosha was always responsive and professional. Highly recommend!")
                        .ownerReply("Thank you so much for your kind words! It was a pleasure having you as a tenant.")
                        .repliedAt(LocalDateTime.now().minusDays(5))
                        .status(ReviewStatus.APPROVED)
                        .createdAt(LocalDateTime.now().minusDays(10))
                        .build();
                reviewRepository.save(review1);

                // Maintenance
                MaintenanceRequest maint = MaintenanceRequest.builder()
                        .propertyId(prop2.getId())
                        .tenantId(tenant.getId())
                        .title("Air Conditioning Not Cooling Properly")
                        .description("The AC unit in the bedroom has stopped cooling effectively.")
                        .priority("HIGH")
                        .status(MaintenanceStatus.RESOLVED)
                        .createdAt(LocalDateTime.now().minusDays(20))
                        .build();
                maintenanceRepository.save(maint);

                System.out.println("====== Realistic Demo Data Seeded Successfully ======");
            }
        };
    }
}
