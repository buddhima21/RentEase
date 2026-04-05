package com.rentease.modules.agreement.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Marks agreements expired when past end date and sends 7-day renewal reminders.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AgreementSchedulerService {

    private final AgreementService agreementService;

    /** Run daily at 06:30 server time */
    @Scheduled(cron = "0 30 6 * * *")
    public void runDailyAgreementMaintenance() {
        try {
            agreementService.markExpiredAgreements();
            agreementService.sendSevenDayRenewalReminders();
        } catch (Exception e) {
            log.error("Agreement scheduler failed: {}", e.getMessage(), e);
        }
    }
}
