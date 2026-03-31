package com.rentease.modules.property.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin moderation actions on property listings.
 * Action must be "APPROVE" or "REJECT".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminModerationRequest {

    @NotBlank(message = "Action is required (APPROVE or REJECT)")
    private String action;

    private String remarks;
}
