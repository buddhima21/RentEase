package com.rentease.modules.analytics.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class OwnerAnalyticsResponse {
    private long totalProperties;
    private long activeBookings;
    private double occupancyRate;
    private double totalRevenue;
    private double averageRating;
    private long pendingReviews;
    private long pendingMaintenanceRequests;
    
    // For charts
    private List<RevenuePoint> revenueHistory;
    private Map<String, Long> propertyStatusDistribution;

    @Data
    @Builder
    public static class RevenuePoint {
        private String month;
        private double revenue;
    }
}
