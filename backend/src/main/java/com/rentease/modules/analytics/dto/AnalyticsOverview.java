package com.rentease.modules.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsOverview {

    private long totalProperties;
    private long availableProperties;
    private long rentedProperties;
    private long totalUsers;
    private long totalBookings;
    private long activeBookings;
    private long pendingMaintenanceRequests;
    private double totalRevenue;
}
