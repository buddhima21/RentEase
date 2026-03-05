package com.rentease.modules.analytics.controller;

import com.rentease.common.ApiResponse;
import com.rentease.modules.analytics.dto.AnalyticsOverview;
import com.rentease.modules.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsOverview>> getOverview() {
        AnalyticsOverview overview = analyticsService.getOverview();
        return ResponseEntity.ok(ApiResponse.success(overview));
    }
}
