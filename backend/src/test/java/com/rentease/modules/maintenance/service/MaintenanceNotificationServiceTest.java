package com.rentease.modules.maintenance.service;

import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.user.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceNotificationServiceTest {

    @Mock
    private ObjectProvider<JavaMailSender> mailSenderProvider;

    @Mock
    private JavaMailSender mailSender;

    @InjectMocks
    private MaintenanceNotificationService maintenanceNotificationService;

    private User adminOne;
    private User adminTwo;
    private User tenant;
    private User technician;
    private Property property;
    private MaintenanceRequest request;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(maintenanceNotificationService, "fromAddress", "noreply@rentease.com");

        adminOne = User.builder().id("admin-1").fullName("Admin One").email("admin1@rentease.com").build();
        adminTwo = User.builder().id("admin-2").fullName("Admin Two").email("admin2@rentease.com").build();
        tenant = User.builder().id("tenant-1").fullName("John Tenant").email("tenant@rentease.com").build();
        technician = User.builder().id("tech-1").fullName("Jane Tech").email("tech@rentease.com").build();

        property = Property.builder().id("prop-1").title("Lake View Apartment").build();

        request = MaintenanceRequest.builder()
                .id("req-1")
                .title("AC Not Working")
                .priority("HIGH")
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();
    }

    @Test
    void notifyAdminsOnCreated_WithTwoAdmins_ShouldSendTwoEmails() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);

        maintenanceNotificationService.notifyAdminsOnCreated(Arrays.asList(adminOne, adminTwo), request, tenant, property);

        verify(mailSender, times(2)).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyAdminsOnCreated_WithEmptyAdminList_ShouldNotSendEmail() {
        maintenanceNotificationService.notifyAdminsOnCreated(Collections.emptyList(), request, tenant, property);

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyAdminsOnCreated_WithNullAdminList_ShouldNotSendEmail() {
        maintenanceNotificationService.notifyAdminsOnCreated(null, request, tenant, property);

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyAdminsOnCreated_ShouldSkipBlankEmails() {
        User blankEmailAdmin = User.builder().id("admin-3").fullName("No Email").email(" ").build();
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);

        maintenanceNotificationService.notifyAdminsOnCreated(Arrays.asList(adminOne, blankEmailAdmin), request, tenant, property);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyAdminsOnCreated_ShouldPopulateMessageFields() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        maintenanceNotificationService.notifyAdminsOnCreated(Collections.singletonList(adminOne), request, tenant, property);

        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();

        assertThat(message.getFrom()).isEqualTo("noreply@rentease.com");
        assertThat(message.getTo()).containsExactly("admin1@rentease.com");
        assertThat(message.getSubject()).contains("New maintenance request");
        assertThat(message.getText()).contains("Request ID: req-1")
                .contains("Tenant: John Tenant")
                .contains("Property: Lake View Apartment")
                .contains("Priority: HIGH");
    }

    @Test
    void notifyTechnicianAssigned_WithValidTechnician_ShouldSendEmail() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);

        maintenanceNotificationService.notifyTechnicianAssigned(technician, request);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyTechnicianAssigned_WithNullTechnician_ShouldNotSendEmail() {
        maintenanceNotificationService.notifyTechnicianAssigned(null, request);

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyTechnicianAssigned_WithBlankEmail_ShouldNotSendEmail() {
        User techWithoutEmail = User.builder().id("tech-2").fullName("No Email Tech").email(" ").build();

        maintenanceNotificationService.notifyTechnicianAssigned(techWithoutEmail, request);

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyTenantStatusChanged_WithValidTenant_ShouldSendEmail() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);

        maintenanceNotificationService.notifyTenantStatusChanged(tenant, request);

        verify(mailSender).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyTenantStatusChanged_WithNullTenant_ShouldNotSendEmail() {
        maintenanceNotificationService.notifyTenantStatusChanged(null, request);

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyTenantStatusChanged_WithBlankEmail_ShouldNotSendEmail() {
        User tenantNoEmail = User.builder().id("tenant-2").fullName("No Email Tenant").email("").build();

        maintenanceNotificationService.notifyTenantStatusChanged(tenantNoEmail, request);

        verify(mailSenderProvider, never()).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void notifyTenantStatusChanged_ShouldPopulateMessageFields() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);

        maintenanceNotificationService.notifyTenantStatusChanged(tenant, request);

        verify(mailSender).send(captor.capture());
        SimpleMailMessage message = captor.getValue();

        assertThat(message.getFrom()).isEqualTo("noreply@rentease.com");
        assertThat(message.getTo()).containsExactly("tenant@rentease.com");
        assertThat(message.getSubject()).contains("Maintenance status update");
        assertThat(message.getText()).contains("Request ID: req-1")
                .contains("Title: AC Not Working");
    }

    @Test
    void sendEmail_WhenMailSenderNotConfigured_ShouldSkipSending() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(null);

        maintenanceNotificationService.notifyTenantStatusChanged(tenant, request);

        verify(mailSenderProvider, times(1)).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendEmail_WhenFromAddressBlank_ShouldSkipSending() {
        ReflectionTestUtils.setField(maintenanceNotificationService, "fromAddress", "");
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);

        maintenanceNotificationService.notifyTenantStatusChanged(tenant, request);

        verify(mailSenderProvider, times(1)).getIfAvailable();
        verify(mailSender, never()).send(any(SimpleMailMessage.class));
    }

    @Test
    void sendEmail_WhenMailSenderThrows_ShouldCatchAndContinue() {
        when(mailSenderProvider.getIfAvailable()).thenReturn(mailSender);
        doThrow(new RuntimeException("SMTP unavailable")).when(mailSender).send(any(SimpleMailMessage.class));

        maintenanceNotificationService.notifyTenantStatusChanged(tenant, request);

        verify(mailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
