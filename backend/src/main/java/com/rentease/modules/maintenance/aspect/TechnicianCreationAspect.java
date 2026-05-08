package com.rentease.modules.maintenance.aspect;

import com.rentease.modules.maintenance.service.MaintenanceNotificationService;
import com.rentease.modules.user.dto.UserRequest;
import com.rentease.modules.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

/**
 * Intercepts successful technician account creations and fires a welcome email
 * containing the new technician's login credentials.
 *
 * <p>This aspect lives entirely inside the maintenance module so that no changes
 * are needed in {@code UserService} or any other user-module class.
 *
 * <p>The advice is {@code @AfterReturning} which means:
 * <ul>
 *   <li>It only fires when {@code createTechnicianByAdmin} <em>completes successfully</em>.
 *       If the method throws (e.g. duplicate email), no email is sent.</li>
 *   <li>The account is already committed to the database before this advice runs.</li>
 *   <li>Any failure inside the advice is caught and logged — it cannot roll back
 *       the account creation or affect the API response.</li>
 * </ul>
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class TechnicianCreationAspect {

    private final MaintenanceNotificationService notificationService;

    /**
     * Fires after {@code UserService.createTechnicianByAdmin} returns successfully.
     *
     * @param request  the original {@link UserRequest} containing the plain-text password
     * @param adminId  the ID of the admin who triggered the creation (not used here)
     * @param response the {@link UserResponse} returned by the service (contains email + name)
     */
    @AfterReturning(
            pointcut = "execution(* com.rentease.modules.user.service.UserService.createTechnicianByAdmin(..)) "
                     + "&& args(request, adminId)",
            returning = "response"
    )
    public void onTechnicianCreated(UserRequest request, String adminId, UserResponse response) {
        try {
            if (response == null || response.getEmail() == null || response.getEmail().isBlank()) {
                log.warn("TechnicianCreationAspect: skipping welcome email — response email is blank");
                return;
            }

            notificationService.notifyTechnicianAccountCreated(
                    response.getEmail(),
                    response.getFullName(),
                    request.getPassword()   // plain-text password, captured before BCrypt encoding in UserService
            );

            log.debug("TechnicianCreationAspect: welcome email queued for {}", response.getEmail());
        } catch (Exception ex) {
            // Defensive catch — account creation is already complete; email failure must not bubble up
            log.warn("TechnicianCreationAspect: failed to queue welcome email for {}: {}",
                    response != null ? response.getEmail() : "unknown", ex.getMessage());
        }
    }
}
