package com.rentease.modules.maintenance.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceSchedulerService {

    private final MaintenanceService maintenanceService;

    @Scheduled(cron = "${rentease.maintenance.closure.auto-close-cron:0 0 3 * * *}")
    public void autoCloseExpiredResolvedRequests() {
        try {
            int closedCount = maintenanceService.autoCloseExpiredResolvedRequests();
            if (closedCount > 0) {
                log.info("Auto-closed {} resolved maintenance request(s)", closedCount);
            }
        } catch (Exception ex) {
            log.error("Maintenance auto-close scheduler failed: {}", ex.getMessage(), ex);
        }
    }
}
