package com.rentease.modules.maintenance.service;

import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.user.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceNotificationService {

    private static final Duration TENANT_STATUS_DEDUP_WINDOW = Duration.ofMinutes(5);
    private final Map<String, LocalDateTime> tenantStatusNotificationRegistry = new ConcurrentHashMap<>();

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${rentease.mail.from:}")
    private String fromAddress;

    public void notifyAdminsOnCreated(List<User> admins, MaintenanceRequest request, User tenant, Property property) {
        if (admins == null || admins.isEmpty()) {
            return;
        }

        String subject = "New maintenance request: " + request.getTitle();
        String body = "A new maintenance request was submitted.\n\n"
                + "Request ID: " + request.getId() + "\n"
                + "Tenant: " + tenant.getFullName() + "\n"
                + "Property: " + property.getTitle() + "\n"
                + "Priority: " + request.getPriority() + "\n";

        admins.stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .forEach(email -> sendEmail(email, subject, body));
    }

    public void notifyTechnicianAssigned(User technician, MaintenanceRequest request, User tenant, Property property) {
        if (technician == null || technician.getEmail() == null || technician.getEmail().isBlank()) {
            return;
        }

        String subject = "Maintenance assignment: " + request.getTitle();
        String body = "You have been assigned a maintenance request.\n\n"
                + "Request ID: " + request.getId() + "\n"
                + "Tenant: " + (tenant != null ? tenant.getFullName() : "Unknown") + "\n"
                + "Tenant Phone: " + (tenant != null && tenant.getPhone() != null ? tenant.getPhone() : "Not provided") + "\n"
                + "Property: " + (property != null ? property.getTitle() : request.getPropertyId()) + "\n"
                + "Priority: " + request.getPriority() + "\n"
                + "Scheduled: " + request.getScheduledAt() + "\n";
        sendEmail(technician.getEmail(), subject, body);
    }

    public void notifyTenantStatusChanged(User tenant, MaintenanceRequest request) {
        if (tenant == null || tenant.getEmail() == null || tenant.getEmail().isBlank()) {
            return;
        }
        if (request == null || request.getId() == null || request.getStatus() == null) {
            return;
        }

        String dedupKey = tenant.getEmail() + "|" + request.getId() + "|" + request.getStatus();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime lastNotifiedAt = tenantStatusNotificationRegistry.get(dedupKey);
        if (lastNotifiedAt != null && Duration.between(lastNotifiedAt, now).compareTo(TENANT_STATUS_DEDUP_WINDOW) < 0) {
            log.info("Skipping duplicate tenant status notification for key {}", dedupKey);
            return;
        }
        tenantStatusNotificationRegistry.put(dedupKey, now);

        String subject = "Maintenance status update: " + request.getStatus();
        String body = "Your maintenance request has been updated.\n\n"
                + "Request ID: " + request.getId() + "\n"
                + "Title: " + request.getTitle() + "\n"
                + "Status: " + request.getStatus() + "\n";
        sendEmail(tenant.getEmail(), subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || fromAddress == null || fromAddress.isBlank()) {
            log.warn("Mail not configured (JavaMailSender or rentease.mail.from), skipping mail to {}", to);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            sender.send(message);
        } catch (Exception ex) {
            log.error("Failed to send maintenance notification to {}: {}", to, ex.getMessage());
        }
    }
}
