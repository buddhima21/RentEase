package com.rentease.modules.maintenance.service;

import com.rentease.modules.maintenance.model.MaintenanceRequest;
import com.rentease.modules.property.model.Property;
import com.rentease.modules.user.model.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Branded HTML email notifications for every maintenance workflow event.
 *
 * <p>All public methods are annotated {@code @Async("mailExecutor")} so SMTP
 * latency or failure never blocks the calling API thread. A failed send is
 * logged as a warning but never surfaced to the caller.
 *
 * <p>If {@code JavaMailSender} is absent (mail auto-config disabled) or the
 * {@code rentease.mail.from} property is blank, every send is silently skipped.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MaintenanceNotificationService {

    // ── Deduplication ───────────────────────────────────────────────────────

    private static final Duration DEDUP_WINDOW = Duration.ofMinutes(5);
    private final Map<String, LocalDateTime> dedupRegistry = new ConcurrentHashMap<>();

    // ── Dependencies ────────────────────────────────────────────────────────

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${rentease.mail.from:}")
    private String fromAddress;

    // ── Date formatting ─────────────────────────────────────────────────────

    private static final DateTimeFormatter DISPLAY_FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private static String fmt(LocalDateTime dt) {
        return dt == null ? "Not set" : dt.format(DISPLAY_FMT);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Public API — Tenant
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Sent immediately after a tenant submits a new maintenance request.
     */
    @Async("mailExecutor")
    public void notifyTenantSubmitted(User tenant, MaintenanceRequest request) {
        if (!isEmailValid(tenant)) return;

        String subject = "We received your maintenance request — " + request.getTitle();
        String body = "Thank you for submitting your maintenance request. "
                + "Our team has received it and will assign a technician as soon as possible.";

        String details = buildDetailsTable(
                row("Request ID", shortId(request.getId())),
                row("Title", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Priority", request.getPriority()),
                row("Submitted", fmt(request.getCreatedAt())),
                row("SLA deadline", fmt(request.getSlaDueAt()))
        );

        sendHtml(tenant.getEmail(), subject, "We received your request", body, details);
    }

    /**
     * Sent to a newly provisioned technician account immediately after the admin creates it.
     * Includes their login email and the plain-text password set by the admin so they can
     * sign in to the technician portal straight away.
     *
     * <p>Called by {@code TechnicianCreationAspect} via Spring AOP — no changes to
     * {@code UserService} are required.
     *
     * @param email           the technician's login email address
     * @param fullName        the technician's full name
     * @param plainTextPassword the password as entered by the admin (before BCrypt encoding)
     */
    @Async("mailExecutor")
    public void notifyTechnicianAccountCreated(String email, String fullName, String plainTextPassword) {
        if (email == null || email.isBlank()) return;

        String subject = "Welcome to RentEase — your technician account is ready";
        String body = "An administrator has created a technician account for you on the RentEase platform. "
                + "Use the credentials below to sign in to the technician portal. "
                + "Please keep your login details secure and do not share them with anyone.";

        String details = buildDetailsTable(
                row("Name", fullName),
                row("Login email", email),
                row("Password", plainTextPassword),
                row("Portal", "/technician/login")
        );

        sendHtml(email, subject, "Your account has been created", body, details);
    }

    /**
     * Sent to the tenant on every meaningful status change.
     * Uses per-status plain-English messaging so tenants understand exactly what happened.
     */
    @Async("mailExecutor")
    public void notifyTenantStatusChanged(User tenant, MaintenanceRequest request) {
        if (!isEmailValid(tenant)) return;
        if (request == null || request.getStatus() == null) return;

        String dedupKey = tenant.getEmail() + "|" + request.getId() + "|" + request.getStatus();
        if (isDuplicate(dedupKey)) return;
        registerDedup(dedupKey);

        String subject;
        String heading;
        String body;

        switch (request.getStatus()) {
            case ASSIGNED -> {
                subject = "Technician assigned to your request";
                heading = "A technician has been assigned";
                body    = "An administrator has assigned a technician to your request. "
                        + "You will receive another notification once a visit time is confirmed.";
            }
            case SCHEDULED -> {
                subject = "Visit scheduled for your maintenance request";
                heading = "Your visit has been scheduled";
                body    = "A technician has been scheduled to attend to your maintenance issue. "
                        + "Please ensure that access to the property is available at the scheduled time.";
            }
            case IN_PROGRESS -> {
                subject = "Work has started on your request";
                heading = "Work is now in progress";
                body    = "Your assigned technician is now actively working on the issue at your property.";
            }
            case PAUSED -> {
                subject = "Work on your request has been paused";
                heading = "Work has been temporarily paused";
                body    = "Work on your maintenance request has been paused. "
                        + "Your technician will resume as soon as they are ready to continue.";
            }
            case RESOLVED -> {
                subject = "Your maintenance issue has been resolved";
                heading = "Your request has been resolved";
                body    = "Your technician has marked the work as complete. "
                        + "The request will be formally closed and archived shortly.";
            }
            case CLOSED -> {
                subject = "Your maintenance request has been closed";
                heading = "Request closed";
                body    = "This maintenance request has been fully closed and archived. "
                        + "Thank you for using the RentEase maintenance system.";
            }
            case DECLINED -> {
                subject = "Your maintenance request could not be accepted";
                heading = "Request declined";
                body    = "Your request has been reviewed but could not be accepted at this time. "
                        + "Please contact your property manager for further assistance.";
            }
            default -> {
                // REPORTED, CANCELLED — handled by dedicated methods; skip generic update
                return;
            }
        }

        String details = buildDetailsTable(
                row("Request", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Priority", request.getPriority()),
                row("Status", request.getStatus().name()),
                row("Scheduled visit", fmt(request.getScheduledAt())),
                request.getTechnicianNotes() != null && !request.getTechnicianNotes().isBlank()
                        ? row("Technician notes", request.getTechnicianNotes())
                        : null
        );

        sendHtml(tenant.getEmail(), subject, heading, body, details);
    }

    /**
     * Sent to the tenant when they successfully cancel their own request.
     */
    @Async("mailExecutor")
    public void notifyTenantCancellationConfirmed(User tenant, MaintenanceRequest request) {
        if (!isEmailValid(tenant)) return;

        String subject = "Your cancellation has been confirmed";
        String body    = "Your maintenance request has been cancelled as requested. "
                       + "No further action is required on your part.";

        String details = buildDetailsTable(
                row("Request", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Cancelled at", fmt(LocalDateTime.now()))
        );

        sendHtml(tenant.getEmail(), subject, "Cancellation confirmed", body, details);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Public API — Technician
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Sent when a technician is assigned to a request (initial or emergency assignment).
     */
    @Async("mailExecutor")
    public void notifyTechnicianAssigned(User technician, MaintenanceRequest request,
                                         User tenant, Property property) {
        if (!isEmailValid(technician)) return;

        boolean isEmergency = "EMERGENCY".equalsIgnoreCase(request.getPriority());
        String subject = isEmergency
                ? "⚠ EMERGENCY job assigned to you — action required"
                : "New maintenance job assigned to you";
        String heading = isEmergency ? "Emergency job assigned" : "New job assigned";
        String body    = isEmergency
                ? "An emergency maintenance request has been assigned to you and requires immediate attention. "
                  + "Please review the details below and attend to the property as soon as possible."
                : "A maintenance request has been assigned to you. "
                  + "Please review the details below and attend to the property at the scheduled time.";

        String details = buildDetailsTable(
                row("Request ID", shortId(request.getId())),
                row("Title", request.getTitle()),
                row("Service type", request.getServiceType()),
                row("Priority", request.getPriority()),
                row("Property", property != null ? property.getTitle() : request.getPropertyId()),
                row("Tenant", tenant != null ? tenant.getFullName() : "Unknown"),
                row("Tenant phone", tenant != null && tenant.getPhone() != null ? tenant.getPhone() : "Not provided"),
                row("Scheduled", fmt(request.getScheduledAt())),
                row("SLA deadline", fmt(request.getSlaDueAt())),
                request.getAdminNotes() != null && !request.getAdminNotes().isBlank()
                        ? row("Admin note", request.getAdminNotes())
                        : null
        );

        sendHtml(technician.getEmail(), subject, heading, body, details);
    }

    /**
     * Sent when the admin updates the schedule for a request that already has a technician.
     */
    @Async("mailExecutor")
    public void notifyTechnicianScheduleUpdated(User technician, MaintenanceRequest request) {
        if (!isEmailValid(technician)) return;

        String subject = "Your job schedule has been updated";
        String body    = "The schedule for one of your assigned maintenance jobs has been updated by an administrator. "
                       + "Please take note of the new visit time.";

        String details = buildDetailsTable(
                row("Request", request.getTitle()),
                row("Service type", request.getServiceType()),
                row("New scheduled time", fmt(request.getScheduledAt())),
                request.getAdminNotes() != null && !request.getAdminNotes().isBlank()
                        ? row("Admin note", request.getAdminNotes())
                        : null
        );

        sendHtml(technician.getEmail(), subject, "Schedule updated", body, details);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Public API — Admin
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Sent to all admins when a new maintenance request is submitted.
     */
    @Async("mailExecutor")
    public void notifyAdminsOnCreated(List<User> admins, MaintenanceRequest request,
                                       User tenant, Property property) {
        if (admins == null || admins.isEmpty()) return;

        String subject = "New maintenance request: " + request.getTitle();
        String body    = "A new maintenance request has been submitted and is awaiting admin review.";

        String details = buildDetailsTable(
                row("Request ID", shortId(request.getId())),
                row("Title", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Priority", request.getPriority()),
                row("Tenant", tenant != null ? tenant.getFullName() + " (" + tenant.getEmail() + ")" : "Unknown"),
                row("Property", property != null ? property.getTitle() : request.getPropertyId()),
                row("Submitted", fmt(request.getCreatedAt())),
                row("SLA deadline", fmt(request.getSlaDueAt()))
        );

        admins.stream()
                .filter(a -> a.getEmail() != null && !a.getEmail().isBlank())
                .forEach(admin -> sendHtml(admin.getEmail(), subject, "New maintenance request", body, details));
    }

    /**
     * Sent to all admins when a tenant cancels their own request.
     */
    @Async("mailExecutor")
    public void notifyAdminTenantCancelled(List<User> admins, MaintenanceRequest request, User tenant) {
        if (admins == null || admins.isEmpty()) return;

        String subject = "Tenant cancelled a maintenance request";
        String body    = "A tenant has cancelled their maintenance request. No further action is required unless a technician was already scheduled.";

        String details = buildDetailsTable(
                row("Request", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Tenant", tenant != null ? tenant.getFullName() + " (" + tenant.getEmail() + ")" : "Unknown"),
                row("Cancelled at", fmt(LocalDateTime.now()))
        );

        admins.stream()
                .filter(a -> a.getEmail() != null && !a.getEmail().isBlank())
                .forEach(admin -> sendHtml(admin.getEmail(), subject, "Request cancelled by tenant", body, details));
    }

    /**
     * Sent to all admins when a technician marks a request as resolved.
     */
    @Async("mailExecutor")
    public void notifyAdminResolved(List<User> admins, MaintenanceRequest request) {
        if (admins == null || admins.isEmpty()) return;

        String subject = "Maintenance request resolved — awaiting closure review";
        String body    = "A technician has marked a maintenance request as resolved. "
                       + "The request will be auto-closed once the closure grace period expires. "
                       + "You may manually close it now if everything looks correct.";

        String details = buildDetailsTable(
                row("Request", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Resolved at", fmt(request.getResolvedAt())),
                row("Auto-close due", fmt(request.getClosureDueAt())),
                request.getCompletionSummary() != null && !request.getCompletionSummary().isBlank()
                        ? row("Completion summary", request.getCompletionSummary())
                        : null,
                request.getTechnicianNotes() != null && !request.getTechnicianNotes().isBlank()
                        ? row("Technician notes", request.getTechnicianNotes())
                        : null
        );

        admins.stream()
                .filter(a -> a.getEmail() != null && !a.getEmail().isBlank())
                .forEach(admin -> sendHtml(admin.getEmail(), subject, "Request resolved", body, details));
    }

    /**
     * Sent to all admins when an active request breaches its SLA deadline.
     * Called by the hourly scheduler; internal deduplication prevents repeat alerts within 6 hours.
     */
    @Async("mailExecutor")
    public void notifyAdminSlaBreached(List<User> admins, MaintenanceRequest request) {
        if (admins == null || admins.isEmpty()) return;

        // 6-hour dedup window so the hourly scheduler doesn't spam
        String dedupKey = "SLA_BREACH|" + request.getId();
        LocalDateTime last = dedupRegistry.get(dedupKey);
        if (last != null && Duration.between(last, LocalDateTime.now()).compareTo(Duration.ofHours(6)) < 0) {
            return;
        }
        dedupRegistry.put(dedupKey, LocalDateTime.now());

        String subject = "⚠ SLA Breach: maintenance request is overdue";
        String body    = "A maintenance request has exceeded its SLA deadline and requires immediate attention.";

        String details = buildDetailsTable(
                row("Request", request.getTitle()),
                row("Service", request.getServiceType()),
                row("Priority", request.getPriority()),
                row("Status", request.getStatus().name()),
                row("SLA deadline", fmt(request.getSlaDueAt())),
                row("Overdue by", overdueDuration(request.getSlaDueAt()))
        );

        admins.stream()
                .filter(a -> a.getEmail() != null && !a.getEmail().isBlank())
                .forEach(admin -> sendHtml(admin.getEmail(), subject, "SLA breach detected", body, details));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HTML builder
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Wraps heading + body + optional details table in a clean branded HTML layout.
     * Uses only inline CSS — compatible with all major email clients.
     */
    private String buildHtml(String heading, String bodyText, String detailsTableHtml) {
        return "<!DOCTYPE html><html><head><meta charset='UTF-8'></head><body style='"
                + "margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;'>"
                + "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f1f5f9;padding:32px 0;'>"
                + "<tr><td align='center'>"
                + "<table width='600' cellpadding='0' cellspacing='0' style='"
                + "max-width:600px;width:100%;background:#ffffff;border-radius:12px;"
                + "overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);'>"

                // ── Header bar
                + "<tr><td style='background:#0f172a;padding:24px 32px;'>"
                + "<span style='color:#10b981;font-size:22px;font-weight:900;letter-spacing:-0.5px;'>RentEase</span>"
                + "<span style='color:#64748b;font-size:13px;margin-left:10px;'>Maintenance</span>"
                + "</td></tr>"

                // ── Emerald accent line
                + "<tr><td style='height:3px;background:linear-gradient(90deg,#10b981,#059669);'></td></tr>"

                // ── Body
                + "<tr><td style='padding:32px 32px 8px;'>"
                + "<h2 style='margin:0 0 12px;font-size:20px;font-weight:700;color:#0f172a;'>" + escapeHtml(heading) + "</h2>"
                + "<p style='margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;'>" + escapeHtml(bodyText) + "</p>"
                + "</td></tr>"

                // ── Details table (injected pre-built)
                + (detailsTableHtml != null && !detailsTableHtml.isBlank()
                        ? "<tr><td style='padding:0 32px 24px;'>" + detailsTableHtml + "</td></tr>"
                        : "")

                // ── Footer
                + "<tr><td style='padding:16px 32px 28px;border-top:1px solid #e2e8f0;'>"
                + "<p style='margin:0;font-size:12px;color:#94a3b8;line-height:1.6;'>"
                + "This is an automated notification from the RentEase maintenance system. "
                + "Please do not reply to this email."
                + "</p></td></tr>"

                + "</table></td></tr></table></body></html>";
    }

    /**
     * Builds the details key-value table HTML.
     * Accepts {@code String[]} pairs produced by {@link #row(String, String)}.
     * {@code null} entries are silently skipped (allows conditional rows inline).
     */
    private String buildDetailsTable(String[]... rows) {
        StringBuilder sb = new StringBuilder();
        sb.append("<table width='100%' cellpadding='0' cellspacing='0' style='"
                + "border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:13px;'>");
        boolean first = true;
        for (String[] row : rows) {
            if (row == null) continue;
            String borderTop = first ? "" : "border-top:1px solid #f1f5f9;";
            first = false;
            sb.append("<tr>")
              .append("<td style='").append(borderTop).append("padding:10px 14px;color:#64748b;white-space:nowrap;font-weight:600;background:#f8fafc;width:40%;'>")
              .append(escapeHtml(row[0])).append("</td>")
              .append("<td style='").append(borderTop).append("padding:10px 14px;color:#1e293b;'>")
              .append(escapeHtml(row[1])).append("</td>")
              .append("</tr>");
        }
        sb.append("</table>");
        return sb.toString();
    }

    /** Creates a label/value pair for {@link #buildDetailsTable}. */
    private static String[] row(String label, String value) {
        return new String[]{label, value != null ? value : "—"};
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Send
    // ═══════════════════════════════════════════════════════════════════════

    private void sendHtml(String to, String subject, String heading, String body, String details) {
        JavaMailSender sender = mailSenderProvider.getIfAvailable();
        if (sender == null || fromAddress == null || fromAddress.isBlank()) {
            log.debug("Mail not configured — skipping notification to {}", to);
            return;
        }
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            String html = buildHtml(heading, body, details);
            helper.setText(html, true);
            sender.send(message);
            log.debug("Maintenance notification sent to {}: {}", to, subject);
        } catch (MessagingException ex) {
            log.warn("Failed to send maintenance notification to {}: {}", to, ex.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // Helpers
    // ═══════════════════════════════════════════════════════════════════════

    private boolean isEmailValid(User user) {
        return user != null && user.getEmail() != null && !user.getEmail().isBlank();
    }

    private boolean isDuplicate(String key) {
        LocalDateTime last = dedupRegistry.get(key);
        return last != null && Duration.between(last, LocalDateTime.now()).compareTo(DEDUP_WINDOW) < 0;
    }

    private void registerDedup(String key) {
        dedupRegistry.put(key, LocalDateTime.now());
    }

    private static String shortId(String id) {
        if (id == null) return "—";
        return id.length() > 8 ? id.substring(id.length() - 8).toUpperCase() : id.toUpperCase();
    }

    private static String overdueDuration(LocalDateTime slaDueAt) {
        if (slaDueAt == null) return "Unknown";
        Duration d = Duration.between(slaDueAt, LocalDateTime.now());
        long hours = d.toHours();
        if (hours < 1) return d.toMinutes() + " minutes";
        if (hours < 24) return hours + " hour(s)";
        return (hours / 24) + " day(s)";
    }

    private static String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                   .replace("<", "&lt;")
                   .replace(">", "&gt;")
                   .replace("\"", "&quot;");
    }
}
