package com.rentease.modules.maintenance.repository;

import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataMongoTest
class MaintenanceRepositoryTest {

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    private MaintenanceRequest reqNewestProperty1;
    private MaintenanceRequest reqOlderProperty1;
    private MaintenanceRequest reqProperty2;
    private MaintenanceRequest reqTech2;

    @BeforeEach
    void setUp() {
        maintenanceRepository.deleteAll();

        LocalDateTime now = LocalDateTime.now();

        reqOlderProperty1 = MaintenanceRequest.builder()
                .id("req-older")
                .propertyId("prop-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .title("Leak in sink")
                .priority("LOW")
                .status(MaintenanceStatus.REPORTED)
                .createdAt(now.minusDays(3))
                .build();

        reqNewestProperty1 = MaintenanceRequest.builder()
                .id("req-newest")
                .propertyId("prop-1")
                .tenantId("tenant-1")
                .assignedTechnicianId("tech-1")
                .title("AC not cooling")
                .priority("HIGH")
                .status(MaintenanceStatus.IN_PROGRESS)
                .createdAt(now.minusHours(2))
                .build();

        reqProperty2 = MaintenanceRequest.builder()
                .id("req-prop2")
                .propertyId("prop-2")
                .tenantId("tenant-2")
                .assignedTechnicianId("tech-1")
                .title("Door lock issue")
                .priority("HIGH")
                .status(MaintenanceStatus.RESOLVED)
                .createdAt(now.minusDays(1))
                .build();

        reqTech2 = MaintenanceRequest.builder()
                .id("req-tech2")
                .propertyId("prop-3")
                .tenantId("tenant-3")
                .assignedTechnicianId("tech-2")
                .title("Power socket broken")
                .priority("MEDIUM")
                .status(MaintenanceStatus.PAUSED)
                .createdAt(now.minusHours(6))
                .build();

        maintenanceRepository.saveAll(Arrays.asList(reqOlderProperty1, reqNewestProperty1, reqProperty2, reqTech2));
    }

    @AfterEach
    void tearDown() {
        maintenanceRepository.deleteAll();
    }

    @Test
    void findByPropertyId_ShouldReturnAllForProperty() {
        List<MaintenanceRequest> results = maintenanceRepository.findByPropertyId("prop-1");

        assertThat(results).hasSize(2);
        assertThat(results).extracting(MaintenanceRequest::getId)
                .containsExactlyInAnyOrder("req-older", "req-newest");
    }

    @Test
    void findByTenantId_ShouldReturnAllForTenant() {
        List<MaintenanceRequest> results = maintenanceRepository.findByTenantId("tenant-1");

        assertThat(results).hasSize(2);
        assertThat(results).extracting(MaintenanceRequest::getId)
                .containsExactlyInAnyOrder("req-older", "req-newest");
    }

    @Test
    void findByPropertyIdOrderByCreatedAtDesc_ShouldReturnNewestFirst() {
        List<MaintenanceRequest> results = maintenanceRepository.findByPropertyIdOrderByCreatedAtDesc("prop-1");

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getId()).isEqualTo("req-newest");
        assertThat(results.get(1).getId()).isEqualTo("req-older");
    }

    @Test
    void findByTenantIdOrderByCreatedAtDesc_ShouldReturnNewestFirst() {
        List<MaintenanceRequest> results = maintenanceRepository.findByTenantIdOrderByCreatedAtDesc("tenant-1");

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getId()).isEqualTo("req-newest");
        assertThat(results.get(1).getId()).isEqualTo("req-older");
    }

    @Test
    void findByAssignedTechnicianIdOrderByCreatedAtDesc_ShouldFilterByTechnician() {
        List<MaintenanceRequest> results = maintenanceRepository.findByAssignedTechnicianIdOrderByCreatedAtDesc("tech-1");

        assertThat(results).hasSize(3);
        assertThat(results).extracting(MaintenanceRequest::getId)
                .containsExactly("req-newest", "req-prop2", "req-older");
    }

    @Test
    void findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc_ShouldFilterByTechnicianAndStatus() {
        List<MaintenanceRequest> results = maintenanceRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(
                "tech-1", MaintenanceStatus.IN_PROGRESS
        );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo("req-newest");
    }

    @Test
    void findByStatusOrderByCreatedAtDesc_ShouldFilterByStatus() {
        List<MaintenanceRequest> results = maintenanceRepository.findByStatusOrderByCreatedAtDesc(MaintenanceStatus.REPORTED);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo("req-older");
    }

    @Test
    void findByPriorityIgnoreCaseOrderByCreatedAtDesc_ShouldBeCaseInsensitive() {
        List<MaintenanceRequest> results = maintenanceRepository.findByPriorityIgnoreCaseOrderByCreatedAtDesc("high");

        assertThat(results).hasSize(2);
        assertThat(results).extracting(MaintenanceRequest::getId)
                .containsExactly("req-newest", "req-prop2");
    }

    @Test
    void findByStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc_ShouldApplyBothFilters() {
        List<MaintenanceRequest> results = maintenanceRepository.findByStatusAndPriorityIgnoreCaseOrderByCreatedAtDesc(
                MaintenanceStatus.RESOLVED, "high"
        );

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo("req-prop2");
    }

    @Test
    void findByPropertyIdInOrderByCreatedAtDesc_ShouldReturnForMultipleProperties() {
        List<MaintenanceRequest> results = maintenanceRepository.findByPropertyIdInOrderByCreatedAtDesc(
                Arrays.asList("prop-1", "prop-2")
        );

        assertThat(results).hasSize(3);
        assertThat(results).extracting(MaintenanceRequest::getId)
                .containsExactly("req-newest", "req-prop2", "req-older");
    }

    @Test
    void findByPropertyIdInOrderByCreatedAtDesc_WithNoMatch_ShouldReturnEmpty() {
        List<MaintenanceRequest> results = maintenanceRepository.findByPropertyIdInOrderByCreatedAtDesc(
                Arrays.asList("prop-404")
        );

        assertThat(results).isEmpty();
    }

    @Test
    void findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc_WithNoMatch_ShouldReturnEmpty() {
        List<MaintenanceRequest> results = maintenanceRepository.findByAssignedTechnicianIdAndStatusOrderByCreatedAtDesc(
                "tech-2", MaintenanceStatus.RESOLVED
        );

        assertThat(results).isEmpty();
    }
}
