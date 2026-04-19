package com.rentease.modules.maintenance.controller;

import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.common.enums.UserRole;
import com.rentease.exception.ForbiddenException;
import com.rentease.modules.maintenance.dto.MaintenanceAssignRequest;
import com.rentease.modules.maintenance.dto.MaintenanceRequestDTO;
import com.rentease.modules.maintenance.dto.MaintenanceResolveRequest;
import com.rentease.modules.maintenance.dto.MaintenanceResponse;
import com.rentease.modules.maintenance.dto.MaintenanceScheduleRequest;
import com.rentease.modules.maintenance.dto.TechnicianSummaryResponse;
import com.rentease.modules.maintenance.service.MaintenanceService;
import com.rentease.modules.user.model.User;
import com.rentease.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class MaintenanceControllerTest {

        private MaintenanceController controller;
        private FakeMaintenanceService maintenanceService;

    private MaintenanceRequestDTO requestDTO;
    private MaintenanceResponse response;
        private List<MaintenanceResponse> queue;

    @BeforeEach
    void setUp() {
                maintenanceService = new FakeMaintenanceService();
                controller = new MaintenanceController(maintenanceService);

        requestDTO = MaintenanceRequestDTO.builder()
                .propertyId("prop-1")
                .tenantId("tenant-1")
                .title("AC is leaking")
                .description("Water leaking from indoor unit")
                .serviceType("Electrical")
                .priority("HIGH")
                .imageUrls(List.of("https://img/1.jpg"))
                .build();

        response = MaintenanceResponse.builder()
                .id("req-1")
                .propertyId("prop-1")
                .tenantId("tenant-1")
                .title("AC is leaking")
                .serviceType("Electrical")
                .priority("HIGH")
                .status(MaintenanceStatus.REPORTED)
                .createdAt(LocalDateTime.now())
                .build();

                queue = List.of(response);
                maintenanceService.cannedResponse = response;
                maintenanceService.cannedQueue = queue;
    }

    @Test
        void createRequest_AsTenant_ShouldForwardIsAdminFalse() {
                ResponseEntity<?> entity = controller.createRequest(requestDTO, user("tenant-1", UserRole.TENANT));
                assertEquals(201, entity.getStatusCode().value());
                assertEquals("tenant-1", maintenanceService.lastActorId);
                assertEquals(Boolean.FALSE, maintenanceService.lastIsAdmin);
    }

    @Test
        void createRequest_AsAdmin_ShouldForwardIsAdminTrue() {
                ResponseEntity<?> entity = controller.createRequest(requestDTO, user("admin-1", UserRole.ADMIN));
                assertEquals(201, entity.getStatusCode().value());
                assertEquals("admin-1", maintenanceService.lastActorId);
                assertEquals(Boolean.TRUE, maintenanceService.lastIsAdmin);
    }

    @Test
        void getAdminQueue_AsAdmin_ShouldReturnData() {
                ResponseEntity<?> entity = controller.getAdminQueue(
                                MaintenanceStatus.REPORTED,
                                "HIGH",
                                "tech-1",
                                user("admin-1", UserRole.ADMIN)
                );
                assertEquals(200, entity.getStatusCode().value());
                assertEquals(MaintenanceStatus.REPORTED, maintenanceService.lastStatusFilter);
                assertEquals("HIGH", maintenanceService.lastPriorityFilter);
                assertEquals("tech-1", maintenanceService.lastTechnicianFilter);
    }

    @Test
        void getAdminQueue_AsTenant_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                                controller.getAdminQueue(null, null, null, user("tenant-1", UserRole.TENANT))
                );
    }

    @Test
        void assignTechnician_AsAdmin_ShouldInvokeService() {
                MaintenanceAssignRequest assignRequest = MaintenanceAssignRequest.builder()
                                .technicianId("tech-1")
                                .scheduledAt(LocalDateTime.now().plusDays(1))
                                .adminNotes("Bring replacement parts")
                                .build();

                ResponseEntity<?> entity = controller.assignTechnician("req-1", assignRequest, user("admin-1", UserRole.ADMIN));
                assertEquals(200, entity.getStatusCode().value());
                assertEquals("req-1", maintenanceService.lastRequestId);
                assertNotNull(maintenanceService.lastAssignRequest);
                assertEquals("admin-1", maintenanceService.lastAdminActorId);
    }

    @Test
        void assignTechnician_AsTechnician_ShouldThrowForbidden() {
                MaintenanceAssignRequest assignRequest = MaintenanceAssignRequest.builder().technicianId("tech-1").build();
                assertThrows(ForbiddenException.class, () ->
                                controller.assignTechnician("req-1", assignRequest, user("tech-1", UserRole.TECHNICIAN))
                );
    }

    @Test
        void getByTenant_MismatchedTenant_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                                controller.getByTenant("tenant-2", user("tenant-1", UserRole.TENANT))
                );
    }

    @Test
        void getByTenant_SameTenant_ShouldReturnData() {
                ResponseEntity<?> entity = controller.getByTenant("tenant-1", user("tenant-1", UserRole.TENANT));
                assertEquals(200, entity.getStatusCode().value());
                assertEquals("tenant-1", maintenanceService.lastTenantId);
    }

    @Test
        void startRequest_AsAssignedTechnician_ShouldInvokeService() {
                ResponseEntity<?> entity = controller.startRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(200, entity.getStatusCode().value());
                assertEquals("req-1", maintenanceService.lastRequestId);
                assertEquals("tech-1", maintenanceService.lastTechnicianActorId);
                assertEquals(MaintenanceStatus.IN_PROGRESS, maintenanceService.simulatedStatus);
        }

    @Test
        void acceptPauseResume_AsAssignedTechnician_ShouldInvokeServiceAndUpdateStatus() {
                ResponseEntity<?> acceptEntity = controller.acceptRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(200, acceptEntity.getStatusCode().value());
                assertEquals(MaintenanceStatus.IN_PROGRESS, maintenanceService.simulatedStatus);

                ResponseEntity<?> pauseEntity = controller.pauseRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(200, pauseEntity.getStatusCode().value());
                assertEquals(MaintenanceStatus.PAUSED, maintenanceService.simulatedStatus);

                ResponseEntity<?> resumeEntity = controller.resumeRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(200, resumeEntity.getStatusCode().value());
                assertEquals(MaintenanceStatus.IN_PROGRESS, maintenanceService.simulatedStatus);
    }

    @Test
        void technician_EndToEndFlow_ShouldTransitionToResolved() {
                MaintenanceAssignRequest assignRequest = MaintenanceAssignRequest.builder().technicianId("tech-1").build();
                controller.assignTechnician("req-1", assignRequest, user("admin-1", UserRole.ADMIN));

                controller.acceptRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(MaintenanceStatus.IN_PROGRESS, maintenanceService.simulatedStatus);

                controller.pauseRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(MaintenanceStatus.PAUSED, maintenanceService.simulatedStatus);

                controller.resumeRequest("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(MaintenanceStatus.IN_PROGRESS, maintenanceService.simulatedStatus);

                MaintenanceResolveRequest resolveRequest = MaintenanceResolveRequest.builder()
                        .completionSummary("Repair completed")
                        .technicianNotes("Compressor replaced")
                        .build();
                controller.resolveRequest("req-1", resolveRequest, user("tech-1", UserRole.TECHNICIAN));
                assertEquals(MaintenanceStatus.RESOLVED, maintenanceService.simulatedStatus);
        }

        @Test
        void resolveRequest_AsTechnician_ShouldInvokeService() {
        MaintenanceResolveRequest resolveRequest = MaintenanceResolveRequest.builder()
                .completionSummary("Leak fixed")
                .technicianNotes("Replaced drain pipe")
                .completionImageUrls(List.of("https://img/after.jpg"))
                .build();

                ResponseEntity<?> entity = controller.resolveRequest("req-1", resolveRequest, user("tech-1", UserRole.TECHNICIAN));
                assertEquals(200, entity.getStatusCode().value());
                assertNotNull(maintenanceService.lastResolveRequest);
                assertEquals("tech-1", maintenanceService.lastTechnicianActorId);
    }

    @Test
        void closeRequest_AsTechnician_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                                controller.closeRequest("req-1", "note", user("tech-1", UserRole.TECHNICIAN))
                );
    }

    @Test
        void getById_AsOwnerWithoutPropertyAccess_ShouldThrowForbidden() {
                maintenanceService.userOwnsPropertyReturn = false;
                maintenanceService.cannedResponse = MaintenanceResponse.builder()
                                .id("req-1")
                                .propertyId("prop-1")
                                .tenantId("tenant-1")
                                .assignedTechnicianId("tech-1")
                                .status(MaintenanceStatus.REPORTED)
                                .build();

                assertThrows(ForbiddenException.class, () ->
                                controller.getById("req-1", user("owner-1", UserRole.OWNER))
                );
    }

    @Test
    void getById_AsAssignedTechnician_ShouldAllowAccess() {
                maintenanceService.cannedResponse = MaintenanceResponse.builder()
                                .id("req-1")
                                .propertyId("prop-1")
                                .tenantId("tenant-1")
                                .assignedTechnicianId("tech-1")
                                .status(MaintenanceStatus.IN_PROGRESS)
                                .build();

                ResponseEntity<?> entity = controller.getById("req-1", user("tech-1", UserRole.TECHNICIAN));
                assertEquals(200, entity.getStatusCode().value());
    }

    @Test
    void getById_AsDifferentTechnician_ShouldThrowForbidden() {
                maintenanceService.cannedResponse = MaintenanceResponse.builder()
                                .id("req-1")
                                .propertyId("prop-1")
                                .tenantId("tenant-1")
                                .assignedTechnicianId("tech-2")
                                .status(MaintenanceStatus.IN_PROGRESS)
                                .build();

                assertThrows(ForbiddenException.class, () ->
                        controller.getById("req-1", user("tech-1", UserRole.TECHNICIAN))
                );
    }

    @Test
        void createRequest_ServiceThrowsForbidden_ShouldPropagate() {
                maintenanceService.throwForbiddenOnCreate = true;
                assertThrows(ForbiddenException.class, () ->
                                controller.createRequest(requestDTO, user("tenant-1", UserRole.TENANT))
                );
    }

        @Test
        void getTechnicians_AsAdmin_ShouldReturnList() {
                ResponseEntity<?> entity = controller.getTechnicians(user("admin-1", UserRole.ADMIN));
                assertEquals(200, entity.getStatusCode().value());
                assertTrue(maintenanceService.getTechniciansCalled);
        }

    @Test
    void getByTechnician_SameTechnician_ShouldPassStatusFilter() {
                ResponseEntity<?> entity = controller.getByTechnician(
                        "tech-1",
                        MaintenanceStatus.REPORTED,
                        user("tech-1", UserRole.TECHNICIAN)
                );

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("tech-1", maintenanceService.lastTechnicianQueryId);
                assertEquals(MaintenanceStatus.REPORTED, maintenanceService.lastTechnicianQueryStatus);
    }

    @Test
    void getByTechnician_DifferentTechnician_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.getByTechnician("tech-2", null, user("tech-1", UserRole.TECHNICIAN))
                );
    }

    @Test
    void getTechnicians_AsOwner_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.getTechnicians(user("owner-1", UserRole.OWNER))
                );
    }

    @Test
    void acceptRequest_AsTenant_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.acceptRequest("req-1", user("tenant-1", UserRole.TENANT))
                );
    }

    @Test
    void startRequest_AsOwner_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.startRequest("req-1", user("owner-1", UserRole.OWNER))
                );
    }

    @Test
    void pauseRequest_AsAdmin_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.pauseRequest("req-1", user("admin-1", UserRole.ADMIN))
                );
    }

    @Test
    void resumeRequest_AsTenant_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.resumeRequest("req-1", user("tenant-1", UserRole.TENANT))
                );
    }

    @Test
    void updateStatus_AsAdmin_ShouldForwardStatus() {
                ResponseEntity<?> entity = controller.updateStatus(
                        "req-1",
                        MaintenanceStatus.IN_PROGRESS,
                        user("admin-1", UserRole.ADMIN)
                );

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("req-1", maintenanceService.lastRequestId);
                assertEquals(MaintenanceStatus.IN_PROGRESS, maintenanceService.lastUpdatedStatus);
    }

    @Test
    void updateStatus_AsTenant_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.updateStatus("req-1", MaintenanceStatus.IN_PROGRESS, user("tenant-1", UserRole.TENANT))
                );
    }

    @Test
    void updatePriority_AsAdmin_ShouldForwardPriority() {
                ResponseEntity<?> entity = controller.updatePriority("req-1", "URGENT", user("admin-1", UserRole.ADMIN));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("req-1", maintenanceService.lastRequestId);
                assertEquals("URGENT", maintenanceService.lastUpdatedPriority);
    }

    @Test
    void updatePriority_AsOwner_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.updatePriority("req-1", "HIGH", user("owner-1", UserRole.OWNER))
                );
    }

    @Test
    void getByProperty_AsAdmin_ShouldReturnData() {
                ResponseEntity<?> entity = controller.getByProperty("prop-1", user("admin-1", UserRole.ADMIN));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("prop-1", maintenanceService.lastPropertyId);
    }

    @Test
    void getByProperty_AsOwnerWithAccess_ShouldReturnData() {
                maintenanceService.userOwnsPropertyReturn = true;
                ResponseEntity<?> entity = controller.getByProperty("prop-1", user("owner-1", UserRole.OWNER));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("prop-1", maintenanceService.lastPropertyId);
    }

    @Test
    void getByProperty_AsOwnerWithoutAccess_ShouldThrowForbidden() {
                maintenanceService.userOwnsPropertyReturn = false;

                assertThrows(ForbiddenException.class, () ->
                        controller.getByProperty("prop-1", user("owner-1", UserRole.OWNER))
                );
    }

    @Test
    void getByProperty_AsTenant_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.getByProperty("prop-1", user("tenant-1", UserRole.TENANT))
                );
    }

    @Test
    void getByOwner_AsAdmin_ShouldReturnData() {
                ResponseEntity<?> entity = controller.getByOwner("owner-1", user("admin-1", UserRole.ADMIN));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("owner-1", maintenanceService.lastOwnerId);
    }

    @Test
    void getByOwner_AsSameOwner_ShouldReturnData() {
                ResponseEntity<?> entity = controller.getByOwner("owner-1", user("owner-1", UserRole.OWNER));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("owner-1", maintenanceService.lastOwnerId);
    }

    @Test
    void getByOwner_AsDifferentOwner_ShouldThrowForbidden() {
                assertThrows(ForbiddenException.class, () ->
                        controller.getByOwner("owner-2", user("owner-1", UserRole.OWNER))
                );
    }

    @Test
    void scheduleRequest_AsAdmin_ShouldInvokeService() {
                MaintenanceScheduleRequest scheduleRequest = MaintenanceScheduleRequest.builder()
                        .scheduledAt(LocalDateTime.now().plusDays(1))
                        .technicianId("tech-1")
                        .adminNotes("Morning slot")
                        .build();

                ResponseEntity<?> entity = controller.scheduleRequest("req-1", scheduleRequest, user("admin-1", UserRole.ADMIN));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("req-1", maintenanceService.lastRequestId);
                assertNotNull(maintenanceService.lastScheduleRequest);
                assertEquals("admin-1", maintenanceService.lastAdminActorId);
    }

    @Test
    void scheduleRequest_AsTechnician_ShouldThrowForbidden() {
                MaintenanceScheduleRequest scheduleRequest = MaintenanceScheduleRequest.builder()
                        .scheduledAt(LocalDateTime.now().plusDays(1))
                        .build();

                assertThrows(ForbiddenException.class, () ->
                        controller.scheduleRequest("req-1", scheduleRequest, user("tech-1", UserRole.TECHNICIAN))
                );
    }

    @Test
    void closeRequest_AsAdmin_ShouldInvokeService() {
                ResponseEntity<?> entity = controller.closeRequest("req-1", "Verified closure", user("admin-1", UserRole.ADMIN));

                assertEquals(200, entity.getStatusCode().value());
                assertEquals("req-1", maintenanceService.lastRequestId);
                assertEquals("admin-1", maintenanceService.lastAdminActorId);
                assertEquals("Verified closure", maintenanceService.lastAdminNote);
    }

        private CustomUserDetails user(String userId, UserRole role) {
        User user = User.builder()
                .id(userId)
                .fullName(role.name() + " User")
                .email(role.name().toLowerCase() + "@example.com")
                .password("encoded")
                .role(role)
                .build();
                return new CustomUserDetails(user);
        }

        private static class FakeMaintenanceService extends MaintenanceService {
                MaintenanceResponse cannedResponse = MaintenanceResponse.builder().id("req-1").build();
                List<MaintenanceResponse> cannedQueue = Collections.emptyList();
                boolean throwForbiddenOnCreate;
                boolean userOwnsPropertyReturn = true;
                boolean getTechniciansCalled;

                String lastActorId;
                Boolean lastIsAdmin;
                String lastRequestId;
                String lastAdminActorId;
                String lastTechnicianActorId;
                String lastTenantId;
                MaintenanceAssignRequest lastAssignRequest;
                MaintenanceResolveRequest lastResolveRequest;
                MaintenanceStatus lastStatusFilter;
                String lastPriorityFilter;
                String lastTechnicianFilter;
                String lastTechnicianQueryId;
                MaintenanceStatus lastTechnicianQueryStatus;
                String lastPropertyId;
                String lastOwnerId;
                String lastUpdatedPriority;
                MaintenanceStatus lastUpdatedStatus;
                String lastAdminNote;
                MaintenanceScheduleRequest lastScheduleRequest;
                MaintenanceStatus simulatedStatus = MaintenanceStatus.REPORTED;
                String simulatedAssignedTechnicianId = "tech-1";

                FakeMaintenanceService() {
                        super(null, null, null, null, null);
                }

                @Override
                public MaintenanceResponse createRequest(MaintenanceRequestDTO dto, String actorId, boolean isAdmin) {
                        this.lastActorId = actorId;
                        this.lastIsAdmin = isAdmin;
                        if (throwForbiddenOnCreate) {
                                throw new ForbiddenException("Tenant can only create maintenance requests for their own account");
                        }
                        return cannedResponse;
                }

                @Override
                public List<MaintenanceResponse> getAdminQueue(MaintenanceStatus status, String priority, String technicianId) {
                        this.lastStatusFilter = status;
                        this.lastPriorityFilter = priority;
                        this.lastTechnicianFilter = technicianId;
                        return cannedQueue;
                }

                @Override
                public MaintenanceResponse assignTechnician(String requestId, MaintenanceAssignRequest request, String adminId) {
                        this.lastRequestId = requestId;
                        this.lastAssignRequest = request;
                        this.lastAdminActorId = adminId;
                        this.simulatedAssignedTechnicianId = request.getTechnicianId();
                        return cannedResponse;
                }

                @Override
                public List<MaintenanceResponse> getByTenant(String tenantId) {
                        this.lastTenantId = tenantId;
                        return cannedQueue;
                }

                @Override
                public List<MaintenanceResponse> getByProperty(String propertyId) {
                        this.lastPropertyId = propertyId;
                        return cannedQueue;
                }

                @Override
                public List<MaintenanceResponse> getByOwner(String ownerId) {
                        this.lastOwnerId = ownerId;
                        return cannedQueue;
                }

                @Override
                public MaintenanceResponse updateStatus(String id, MaintenanceStatus status) {
                        this.lastRequestId = id;
                        this.lastUpdatedStatus = status;
                        this.simulatedStatus = status;
                        return MaintenanceResponse.builder().id(id).status(status).build();
                }

                @Override
                public MaintenanceResponse updatePriority(String id, String priority) {
                        this.lastRequestId = id;
                        this.lastUpdatedPriority = priority;
                        return MaintenanceResponse.builder().id(id).priority(priority).build();
                }

                @Override
                public MaintenanceResponse startRequest(String requestId, String technicianId) {
                        this.lastRequestId = requestId;
                        this.lastTechnicianActorId = technicianId;
                        this.simulatedStatus = MaintenanceStatus.IN_PROGRESS;
                        return MaintenanceResponse.builder().id(requestId).status(MaintenanceStatus.IN_PROGRESS).build();
                }

                @Override
                public MaintenanceResponse acceptRequest(String requestId, String technicianId) {
                        this.lastRequestId = requestId;
                        this.lastTechnicianActorId = technicianId;
                        this.simulatedStatus = MaintenanceStatus.IN_PROGRESS;
                        return MaintenanceResponse.builder().id(requestId).status(MaintenanceStatus.IN_PROGRESS).build();
                }

                @Override
                public MaintenanceResponse pauseRequest(String requestId, String technicianId) {
                        this.lastRequestId = requestId;
                        this.lastTechnicianActorId = technicianId;
                        this.simulatedStatus = MaintenanceStatus.PAUSED;
                        return MaintenanceResponse.builder().id(requestId).status(MaintenanceStatus.PAUSED).build();
                }

                @Override
                public MaintenanceResponse resumeRequest(String requestId, String technicianId) {
                        this.lastRequestId = requestId;
                        this.lastTechnicianActorId = technicianId;
                        this.simulatedStatus = MaintenanceStatus.IN_PROGRESS;
                        return MaintenanceResponse.builder().id(requestId).status(MaintenanceStatus.IN_PROGRESS).build();
                }

                @Override
                public MaintenanceResponse resolveRequest(String requestId, String technicianId, MaintenanceResolveRequest resolveRequest) {
                        this.lastRequestId = requestId;
                        this.lastTechnicianActorId = technicianId;
                        this.lastResolveRequest = resolveRequest;
                        this.simulatedStatus = MaintenanceStatus.RESOLVED;
                        return MaintenanceResponse.builder().id(requestId).status(MaintenanceStatus.RESOLVED).build();
                }

                @Override
                public MaintenanceResponse getById(String id) {
                        return cannedResponse;
                }

                @Override
                public boolean userOwnsProperty(String ownerId, String propertyId) {
                        return userOwnsPropertyReturn;
                }

                @Override
                public List<TechnicianSummaryResponse> getTechnicians() {
                        getTechniciansCalled = true;
                        return List.of(TechnicianSummaryResponse.builder().id("tech-1").fullName("Tech One").build());
                }

                @Override
                public List<MaintenanceResponse> getByTechnician(String technicianId, MaintenanceStatus status) {
                        this.lastTechnicianQueryId = technicianId;
                        this.lastTechnicianQueryStatus = status;
                        return cannedQueue;
                }

                @Override
                public MaintenanceResponse scheduleRequest(String requestId, MaintenanceScheduleRequest request, String adminId) {
                        this.lastRequestId = requestId;
                        this.lastScheduleRequest = request;
                        this.lastAdminActorId = adminId;
                        return cannedResponse;
                }

                @Override
                public MaintenanceResponse closeRequest(String requestId, String adminId, String adminNote) {
                        this.lastRequestId = requestId;
                        this.lastAdminActorId = adminId;
                        this.lastAdminNote = adminNote;
                        this.simulatedStatus = MaintenanceStatus.CLOSED;
                        return MaintenanceResponse.builder().id(requestId).status(MaintenanceStatus.CLOSED).build();
                }
    }
}
