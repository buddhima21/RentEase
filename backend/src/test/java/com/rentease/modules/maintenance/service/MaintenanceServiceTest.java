package com.rentease.modules.maintenance.service;

import com.rentease.common.enums.AgreementStatus;
import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.common.enums.UserRole;
import com.rentease.exception.BadRequestException;
import com.rentease.exception.ForbiddenException;
import com.rentease.exception.ResourceNotFoundException;
import com.rentease.modules.agreement.model.Agreement;
import com.rentease.modules.agreement.repository.AgreementRepository;
import com.rentease.modules.maintenance.dto.MaintenanceAssignRequest;
import com.rentease.modules.maintenance.dto.MaintenanceRequestDTO;
import com.rentease.modules.maintenance.dto.MaintenanceResolveRequest;
import com.rentease.modules.maintenance.dto.MaintenanceResponse;
import com.rentease.modules.maintenance.dto.MaintenanceScheduleRequest;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.maintenance.repository.MaintenanceRepository;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.property.repository.PropertyRepository;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PropertyRepository propertyRepository;

    @Mock
    private AgreementRepository agreementRepository;

    @Mock
    private MaintenanceNotificationService maintenanceNotificationService;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private MaintenanceRequest testRequest;
    private User testTenant;
    private User testTechnician;
    private User testAdmin;
    private Property testProperty;
    private Agreement testAgreement;

    @BeforeEach
    void setUp() {
        testTenant = User.builder()
                .id("tenant-1")
                .fullName("John Tenant")
                .email("tenant@example.com")
                .role(UserRole.TENANT)
                .build();

        testTechnician = User.builder()
                .id("tech-1")
                .fullName("Jane Technician")
                .email("tech@example.com")
                .role(UserRole.TECHNICIAN)
                .build();

        testAdmin = User.builder()
                .id("admin-1")
                .fullName("Admin User")
                .email("admin@example.com")
                .role(UserRole.ADMIN)
                .build();

        testProperty = Property.builder()
                .id("prop-1")
                .ownerId("owner-1")
                .title("Test Property")
                .build();

        testAgreement = Agreement.builder()
                .id("agree-1")
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .status(AgreementStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        testRequest = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .status(MaintenanceStatus.REPORTED)
                .imageUrls(Arrays.asList("img1.jpg"))
                .preferredAt(LocalDateTime.now().plusDays(1))
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ============= CREATE REQUEST TESTS =============

    @Test
    void createRequest_WithValidData_ShouldSucceedAndNotifyAdmins() {
        MaintenanceRequestDTO dto = MaintenanceRequestDTO.builder()
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .imageUrls(Arrays.asList("img1.jpg"))
                .preferredAt(LocalDateTime.now().plusDays(1))
                .build();

        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));
        when(propertyRepository.findById("prop-1")).thenReturn(Optional.of(testProperty));
        when(agreementRepository.findByTenantIdOrderByCreatedAtDesc("tenant-1"))
                .thenReturn(Arrays.asList(testAgreement));
        when(maintenanceRepository.save(any())).thenReturn(testRequest);
        when(userRepository.findByRole(UserRole.ADMIN)).thenReturn(Arrays.asList(testAdmin));

        MaintenanceResponse response = maintenanceService.createRequest(dto, "tenant-1", false);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo("req-1");
        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.REPORTED);
        verify(maintenanceRepository).save(any(MaintenanceRequest.class));
        verify(maintenanceNotificationService).notifyAdminsOnCreated(anyList(), any(), any(), any());
    }

    @Test
    void createRequest_NonTenantAttemptingOwnRequest_ShouldSucceedIfAdmin() {
        MaintenanceRequestDTO dto = MaintenanceRequestDTO.builder()
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .imageUrls(Arrays.asList("img1.jpg"))
                .build();

        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));
        when(propertyRepository.findById("prop-1")).thenReturn(Optional.of(testProperty));
        when(agreementRepository.findByTenantIdOrderByCreatedAtDesc("tenant-1"))
                .thenReturn(Arrays.asList(testAgreement));
        when(maintenanceRepository.save(any())).thenReturn(testRequest);
        when(userRepository.findByRole(UserRole.ADMIN)).thenReturn(Arrays.asList(testAdmin));

        MaintenanceResponse response = maintenanceService.createRequest(dto, "admin-1", true);

        assertThat(response).isNotNull();
        verify(maintenanceRepository).save(any());
    }

    @Test
    void createRequest_TenantCreatingForOtherTenant_ShouldThrowForbidden() {
        MaintenanceRequestDTO dto = MaintenanceRequestDTO.builder()
                .tenantId("tenant-2")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .imageUrls(Arrays.asList("img1.jpg"))
                .build();

        assertThatThrownBy(() -> maintenanceService.createRequest(dto, "tenant-1", false))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("only create maintenance requests for their own account");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void createRequest_ForNonTenantUser_ShouldThrowBadRequest() {
        MaintenanceRequestDTO dto = MaintenanceRequestDTO.builder()
                .tenantId("owner-1")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .imageUrls(Arrays.asList("img1.jpg"))
                .build();

        User owner = User.builder()
                .id("owner-1")
                .role(UserRole.OWNER)
                .build();

        when(userRepository.findById("owner-1")).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> maintenanceService.createRequest(dto, "owner-1", false))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("can only be created for tenant users");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void createRequest_WithoutActiveAgreement_ShouldThrowBadRequest() {
        MaintenanceRequestDTO dto = MaintenanceRequestDTO.builder()
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .imageUrls(Arrays.asList("img1.jpg"))
                .build();

        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));
        when(propertyRepository.findById("prop-1")).thenReturn(Optional.of(testProperty));
        when(agreementRepository.findByTenantIdOrderByCreatedAtDesc("tenant-1"))
                .thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> maintenanceService.createRequest(dto, "tenant-1", false))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not have an active agreement");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void createRequest_WithTooManyImages_ShouldThrowBadRequest() {
        MaintenanceRequestDTO dto = MaintenanceRequestDTO.builder()
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .title("Broken AC")
                .description("AC is not cooling")
                .serviceType("REPAIR")
                .priority("HIGH")
                .imageUrls(Arrays.asList("img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg"))
                .build();

        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));
        when(propertyRepository.findById("prop-1")).thenReturn(Optional.of(testProperty));
        when(agreementRepository.findByTenantIdOrderByCreatedAtDesc("tenant-1"))
                .thenReturn(Arrays.asList(testAgreement));

        assertThatThrownBy(() -> maintenanceService.createRequest(dto, "tenant-1", false))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("maximum of 5");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= STATUS TRANSITION TESTS =============

    @Test
    void updateStatus_ValidTransitionReportedToInProgress_ShouldSucceed() {
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .propertyId("prop-1")
                .status(MaintenanceStatus.IN_PROGRESS)
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.updateStatus("req-1", MaintenanceStatus.IN_PROGRESS);

        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.IN_PROGRESS);
        verify(maintenanceRepository).save(argThat(req -> req.getStatus() == MaintenanceStatus.IN_PROGRESS));
    }

    @Test
    void updateStatus_ValidTransitionResolvedToClosed_ShouldSetClosedAt() {
        testRequest.setStatus(MaintenanceStatus.RESOLVED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .status(MaintenanceStatus.CLOSED)
                .closedAt(LocalDateTime.now())
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        maintenanceService.updateStatus("req-1", MaintenanceStatus.CLOSED);

        verify(maintenanceRepository).save(argThat(req ->
                req.getStatus() == MaintenanceStatus.CLOSED && req.getClosedAt() != null
        ));
    }

    @Test
    void updateStatus_InvalidTransitionClosedToReported_ShouldThrowBadRequest() {
        testRequest.setStatus(MaintenanceStatus.CLOSED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.updateStatus("req-1", MaintenanceStatus.REPORTED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void updateStatus_InvalidTransitionInProgressToReported_ShouldThrowBadRequest() {
        testRequest.setStatus(MaintenanceStatus.IN_PROGRESS);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.updateStatus("req-1", MaintenanceStatus.REPORTED))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= PRIORITY UPDATE TESTS =============

    @Test
    void updatePriority_OnOpenRequest_ShouldSucceed() {
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .priority("URGENT")
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.updatePriority("req-1", "URGENT");

        assertThat(response.getPriority()).isEqualTo("URGENT");
        verify(maintenanceRepository).save(any());
    }

    @Test
    void updatePriority_OnClosedRequest_ShouldThrowBadRequest() {
        testRequest.setStatus(MaintenanceStatus.CLOSED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.updatePriority("req-1", "URGENT"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot update priority for a closed request");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= TECHNICIAN ASSIGNMENT TESTS =============

    @Test
    void assignTechnician_ToValidRequest_ShouldSucceed() {
        MaintenanceAssignRequest assignRequest = MaintenanceAssignRequest.builder()
                .technicianId("tech-1")
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));
        when(userRepository.findById("tech-1")).thenReturn(Optional.of(testTechnician));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .assignedByAdminId("admin-1")
                .assignedAt(LocalDateTime.now())
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.assignTechnician("req-1", assignRequest, "admin-1");

        assertThat(response.getAssignedTechnicianId()).isEqualTo("tech-1");
        verify(maintenanceNotificationService).notifyTechnicianAssigned(eq(testTechnician), any());
    }

    @Test
    void assignTechnician_ToClosedRequest_ShouldThrowBadRequest() {
        testRequest.setStatus(MaintenanceStatus.CLOSED);
        MaintenanceAssignRequest assignRequest = MaintenanceAssignRequest.builder()
                .technicianId("tech-1")
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));
        when(userRepository.findById("tech-1")).thenReturn(Optional.of(testTechnician));

        assertThatThrownBy(() -> maintenanceService.assignTechnician("req-1", assignRequest, "admin-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot assign a technician to a resolved or closed request");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void assignTechnician_WithNonTechnicianUser_ShouldThrowBadRequest() {
        MaintenanceAssignRequest assignRequest = MaintenanceAssignRequest.builder()
                .technicianId("owner-1")
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();

        User owner = User.builder()
                .id("owner-1")
                .role(UserRole.OWNER)
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));
        when(userRepository.findById("owner-1")).thenReturn(Optional.of(owner));

        assertThatThrownBy(() -> maintenanceService.assignTechnician("req-1", assignRequest, "admin-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must have TECHNICIAN role");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= ACCEPT/START/PAUSE/RESUME TESTS =============

    @Test
    void acceptRequest_ByAssignedTechnician_ShouldSetStatusToInProgress() {
        testRequest.setAssignedTechnicianId("tech-1");
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .status(MaintenanceStatus.IN_PROGRESS)
                .acceptedAt(LocalDateTime.now())
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.acceptRequest("req-1", "tech-1");

        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.IN_PROGRESS);
        assertThat(response.getAcceptedAt()).isNotNull();
    }

    @Test
    void acceptRequest_ByDifferentTechnician_ShouldThrowForbidden() {
        testRequest.setAssignedTechnicianId("tech-1");
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.acceptRequest("req-1", "tech-2"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("not assigned to this request");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void startRequest_ShouldSetStatusToInProgress() {
        testRequest.setAssignedTechnicianId("tech-1");
        testRequest.setStatus(MaintenanceStatus.IN_PROGRESS);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .status(MaintenanceStatus.IN_PROGRESS)
                .startedAt(LocalDateTime.now())
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        maintenanceService.startRequest("req-1", "tech-1");

        verify(maintenanceRepository).save(argThat(req -> req.getStartedAt() != null));
    }

    @Test
    void pauseRequest_FromInProgress_ShouldSetStatusToPaused() {
        testRequest.setAssignedTechnicianId("tech-1");
        testRequest.setStatus(MaintenanceStatus.IN_PROGRESS);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .status(MaintenanceStatus.PAUSED)
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.pauseRequest("req-1", "tech-1");

        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.PAUSED);
    }

    @Test
    void pauseRequest_NotFromInProgress_ShouldThrowBadRequest() {
        testRequest.setAssignedTechnicianId("tech-1");
        testRequest.setStatus(MaintenanceStatus.REPORTED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.pauseRequest("req-1", "tech-1"))
                .isInstanceOf(BadRequestException.class)
                                .hasMessageContaining("Invalid status transition from REPORTED to PAUSED");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void resumeRequest_FromPaused_ShouldSetStatusToInProgress() {
        testRequest.setAssignedTechnicianId("tech-1");
        testRequest.setStatus(MaintenanceStatus.PAUSED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .status(MaintenanceStatus.IN_PROGRESS)
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.resumeRequest("req-1", "tech-1");

        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.IN_PROGRESS);
    }

    @Test
    void resumeRequest_NotFromPaused_ShouldThrowBadRequest() {
        testRequest.setAssignedTechnicianId("tech-1");
        testRequest.setStatus(MaintenanceStatus.RESOLVED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.resumeRequest("req-1", "tech-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid status transition from RESOLVED to IN_PROGRESS");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= RESOLVE REQUEST TESTS =============

    @Test
    void resolveRequest_ByAssignedTechnician_ShouldSucceed() {
        testRequest.setAssignedTechnicianId("tech-1");
        testRequest.setStatus(MaintenanceStatus.IN_PROGRESS);

        MaintenanceResolveRequest resolveRequest = MaintenanceResolveRequest.builder()
                .completionSummary("Issue fixed")
                .technicianNotes("Unit repaired")
                .completionImageUrls(Arrays.asList("after1.jpg", "after2.jpg"))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .status(MaintenanceStatus.RESOLVED)
                .resolvedAt(LocalDateTime.now())
                .completionSummary("Issue fixed")
                .technicianNotes("Unit repaired")
                .completionImageUrls(Arrays.asList("after1.jpg", "after2.jpg"))
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.resolveRequest("req-1", "tech-1", resolveRequest);

        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.RESOLVED);
        assertThat(response.getResolvedAt()).isNotNull();
        assertThat(response.getCompletionSummary()).isEqualTo("Issue fixed");
    }

    @Test
    void resolveRequest_WithTooManyCompletionImages_ShouldThrowBadRequest() {
        testRequest.setAssignedTechnicianId("tech-1");

        MaintenanceResolveRequest resolveRequest = MaintenanceResolveRequest.builder()
                .completionSummary("Issue fixed")
                .technicianNotes("Unit repaired")
                .completionImageUrls(Arrays.asList("img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg"))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.resolveRequest("req-1", "tech-1", resolveRequest))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("maximum of 5");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= CLOSE REQUEST TESTS =============

    @Test
    void closeRequest_OnResolvedRequest_ShouldSucceed() {
        testRequest.setStatus(MaintenanceStatus.RESOLVED);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .status(MaintenanceStatus.CLOSED)
                .closedAt(LocalDateTime.now())
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.closeRequest("req-1", "admin-1", "Closed by admin");

        assertThat(response.getStatus()).isEqualTo(MaintenanceStatus.CLOSED);
        assertThat(response.getClosedAt()).isNotNull();
    }

    @Test
    void closeRequest_OnNonResolvedRequest_ShouldThrowBadRequest() {
        testRequest.setStatus(MaintenanceStatus.IN_PROGRESS);
        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.closeRequest("req-1", "admin-1", "Closed by admin"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Only resolved requests can be closed");

        verify(maintenanceRepository, never()).save(any());
    }

    // ============= RETRIEVAL TESTS =============

    @Test
    void getByProperty_ShouldReturnRequestsForProperty() {
        List<MaintenanceRequest> requests = Arrays.asList(testRequest);
        when(maintenanceRepository.findByPropertyIdOrderByCreatedAtDesc("prop-1"))
                .thenReturn(requests);

        List<MaintenanceResponse> responses = maintenanceService.getByProperty("prop-1");

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getPropertyId()).isEqualTo("prop-1");
    }

    @Test
    void getByTenant_ShouldReturnTenantRequests() {
        List<MaintenanceRequest> requests = Arrays.asList(testRequest);
        when(maintenanceRepository.findByTenantIdOrderByCreatedAtDesc("tenant-1"))
                .thenReturn(requests);

        List<MaintenanceResponse> responses = maintenanceService.getByTenant("tenant-1");

        assertThat(responses).hasSize(1);
        assertThat(responses.get(0).getTenantId()).isEqualTo("tenant-1");
    }

    @Test
    void getByTechnician_WithoutStatusFilter_ShouldReturnAllAssigned() {
        List<MaintenanceRequest> requests = Arrays.asList(testRequest);
        when(maintenanceRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc("tech-1"))
                .thenReturn(requests);

        List<MaintenanceResponse> responses = maintenanceService.getByTechnician("tech-1", null);

        assertThat(responses).hasSize(1);
    }

    @Test
    void getByTechnician_WithStatusFilter_ShouldReturnFiltered() {
        List<MaintenanceRequest> requests = Arrays.asList(testRequest);
        when(maintenanceRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc("tech-1", MaintenanceStatus.IN_PROGRESS))
                .thenReturn(requests);

        List<MaintenanceResponse> responses = maintenanceService.getByTechnician("tech-1", MaintenanceStatus.IN_PROGRESS);

        assertThat(responses).hasSize(1);
    }

    @Test
    void getByOwner_ShouldReturnRequestsForOwnedProperties() {
        Property property2 = Property.builder().id("prop-2").ownerId("owner-1").build();
        List<Property> properties = Arrays.asList(testProperty, property2);
        List<MaintenanceRequest> requests = Arrays.asList(testRequest);

        when(propertyRepository.findByOwnerId("owner-1")).thenReturn(properties);
        when(maintenanceRepository.findByPropertyIdInOrderByCreatedAtDesc(Arrays.asList("prop-1", "prop-2")))
                .thenReturn(requests);

        List<MaintenanceResponse> responses = maintenanceService.getByOwner("owner-1");

        assertThat(responses).hasSize(1);
    }

    @Test
    void getByOwner_WithNoProperties_ShouldReturnEmpty() {
        when(propertyRepository.findByOwnerId("owner-1")).thenReturn(Collections.emptyList());

        List<MaintenanceResponse> responses = maintenanceService.getByOwner("owner-1");

        assertThat(responses).isEmpty();
        verify(maintenanceRepository, never()).findByPropertyIdInOrderByCreatedAtDesc(any());
    }

    @Test
    void getAdminQueue_WithStatusAndPriority_ShouldFilterCorrectly() {
        when(maintenanceRepository.findByStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(MaintenanceStatus.REPORTED, "HIGH"))
                .thenReturn(Arrays.asList(testRequest));

        List<MaintenanceResponse> responses = maintenanceService.getAdminQueue(MaintenanceStatus.REPORTED, "HIGH", null);

        assertThat(responses).hasSize(1);
    }

        @Test
        void getAdminQueue_WithTechnicianAndStatus_ShouldUseCombinedRepositoryFilter() {
                when(maintenanceRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc("tech-1", MaintenanceStatus.REPORTED))
                                .thenReturn(Arrays.asList(testRequest));

                List<MaintenanceResponse> responses = maintenanceService.getAdminQueue(MaintenanceStatus.REPORTED, null, "tech-1");

                assertThat(responses).hasSize(1);
                verify(maintenanceRepository).findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc("tech-1", MaintenanceStatus.REPORTED);
                verify(maintenanceRepository, never()).findAll();
        }

        @Test
        void getAdminQueue_WithTechnicianStatusAndPriority_ShouldUseFullCombinedRepositoryFilter() {
                when(maintenanceRepository.findByAssignedTechnicianIdAndStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(
                                "tech-1", MaintenanceStatus.REPORTED, "HIGH"
                )).thenReturn(Arrays.asList(testRequest));

                List<MaintenanceResponse> responses = maintenanceService.getAdminQueue(MaintenanceStatus.REPORTED, "HIGH", "tech-1");

                assertThat(responses).hasSize(1);
                verify(maintenanceRepository).findByAssignedTechnicianIdAndStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(
                                "tech-1", MaintenanceStatus.REPORTED, "HIGH"
                );
                verify(maintenanceRepository, never()).findAll();
        }

    @Test
    void getTechnicians_ShouldReturnAllTechnicianUsers() {
        when(userRepository.findByRole(UserRole.TECHNICIAN)).thenReturn(Arrays.asList(testTechnician));

        var summaries = maintenanceService.getTechnicians();

        assertThat(summaries).hasSize(1);
        assertThat(summaries.get(0).getId()).isEqualTo("tech-1");
    }

    @Test
    void userOwnsProperty_WhenBecomesTrue_ShouldReturnTrue() {
        when(propertyRepository.findById("prop-1")).thenReturn(Optional.of(testProperty));

        boolean owns = maintenanceService.userOwnsProperty("owner-1", "prop-1");

        assertThat(owns).isTrue();
    }

    @Test
    void userOwnsProperty_WhenDifferentOwner_ShouldReturnFalse() {
        when(propertyRepository.findById("prop-1")).thenReturn(Optional.of(testProperty));

        boolean owns = maintenanceService.userOwnsProperty("different-owner", "prop-1");

        assertThat(owns).isFalse();
    }

    // ============= SCHEDULE REQUEST TESTS =============

    @Test
    void scheduleRequest_WithoutTechnician_ShouldOnlySetScheduledTime() {
        MaintenanceScheduleRequest scheduleRequest = MaintenanceScheduleRequest.builder()
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        MaintenanceRequest updated = MaintenanceRequest.builder()
                .id("req-1")
                .tenantId("tenant-1")
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();
        when(maintenanceRepository.save(any())).thenReturn(updated);
        when(userRepository.findById("tenant-1")).thenReturn(Optional.of(testTenant));

        MaintenanceResponse response = maintenanceService.scheduleRequest("req-1", scheduleRequest, "admin-1");

        assertThat(response.getScheduledAt()).isNotNull();
    }

    @Test
    void scheduleRequest_WithFutureDateTime_ShouldFail() {
        MaintenanceScheduleRequest scheduleRequest = MaintenanceScheduleRequest.builder()
                .scheduledAt(LocalDateTime.now().minusHours(2))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.scheduleRequest("req-1", scheduleRequest, "admin-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("must be in the future");

        verify(maintenanceRepository, never()).save(any());
    }

    @Test
    void scheduleRequest_OnClosedRequest_ShouldThrowBadRequest() {
        testRequest.setStatus(MaintenanceStatus.CLOSED);
        MaintenanceScheduleRequest scheduleRequest = MaintenanceScheduleRequest.builder()
                .scheduledAt(LocalDateTime.now().plusDays(1))
                .build();

        when(maintenanceRepository.findById("req-1")).thenReturn(Optional.of(testRequest));

        assertThatThrownBy(() -> maintenanceService.scheduleRequest("req-1", scheduleRequest, "admin-1"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot schedule a resolved or closed request");

        verify(maintenanceRepository, never()).save(any());
    }
}
