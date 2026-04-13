package com.rentease.modules.review.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailedRating {
    @Builder.Default
    private int cleanliness = 5;
    
    @Builder.Default
    private int safety = 5;
    
    @Builder.Default
    private int wifi = 5;
    
    @Builder.Default
    private int water = 5;
}
