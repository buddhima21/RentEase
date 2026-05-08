package com.rentease.modules.maintenance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TechnicianSummaryResponse {
    private String id;
    private String fullName;
    private String email;
    private String phone;
}
