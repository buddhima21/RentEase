package com.rentease.modules.maintenance.service;

import com.rentease.common.enums.MaintenanceStatus;
import com.rentease.common.enums.UserRole;
import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.user.model.User;
import com.rentease.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceSchedulerService {

    private final MaintenanceService maintenanceService;
    private final MaintenanceNotificationService maintenanceNotificationService;
    private final UserRepository userRepository;

    private static final Set<MaintenanceStatus> TERMINAL_STATUSES = Set.of(
            MaintenanceStatus.RESOLVED,
            MaintenanceStatus.CLOSED,
            MaintenanceStatus.CANCELLED,
            MaintenanceStatus.DECLINED
    );

    /**
     * Runs at 03:00 every day and auto-closes requests that have
     * exceeded the closure grace period since resolution.
     */
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

    /**
     * Runs every hour and sends SLA breach alerts to all admins
     * for any active request past its SLA deadline.
     * Internal deduplication in {@link MaintenanceNotificationService} ensures
     * each breach is only notified once every 6 hours.
     */
    @Scheduled(cron = "${rentease.maintenance.sla.breach-check-cron:0 0 * * * *}")
    public void checkSlaBreaches() {
        try {
            List<MaintenanceRequest> breached = maintenanceService.findSlaBreachedActiveRequests();
            if (breached.isEmpty()) return;

            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            if (admins.isEmpty()) return;

            for (MaintenanceRequest request : breached) {
                maintenanceNotificationService.notifyAdminSlaBreached(admins, request);
            }

            log.info("SLA breach check: {} overdue request(s) processed", breached.size());
        } catch (Exception ex) {
            log.error("SLA breach scheduler failed: {}", ex.getMessage(), ex);
        }
    }
}
