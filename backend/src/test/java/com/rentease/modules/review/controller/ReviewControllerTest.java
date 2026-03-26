package com.rentease.modules.review.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rentease.common.enums.ReviewStatus;
import com.rentease.modules.review.dto.ReviewRequest;
import com.rentease.modules.review.dto.ReviewResponse;
import com.rentease.modules.review.service.ReviewService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ReviewController.class)
class ReviewControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ReviewService reviewService;

    private ReviewRequest reviewRequest;
    private ReviewResponse reviewResponse;

    @BeforeEach
    void setUp() {
        reviewRequest = new ReviewRequest();
        reviewRequest.setPropertyId("prop1");
        reviewRequest.setReviewerId("user1");
        reviewRequest.setRating(5);
        reviewRequest.setComment("Amazing!");

        reviewResponse = ReviewResponse.builder()
                .id("rev1")
                .propertyId("prop1")
                .reviewerId("user1")
                .rating(5)
                .comment("Amazing!")
                .status(ReviewStatus.PENDING)
                .build();
    }

    @Test
    void createReview_ValidRequest_ShouldReturn201() throws Exception {
        when(reviewService.createReview(any(ReviewRequest.class), any())).thenReturn(reviewResponse);

        mockMvc.perform(post("/api/v1/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Review submitted successfully and is pending approval"))
                .andExpect(jsonPath("$.data.propertyId").value("prop1"))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    void createReview_InvalidRequest_ShouldReturn400() throws Exception {
        reviewRequest.setRating(6); // Invalid rating (max 5)

        mockMvc.perform(post("/api/v1/reviews")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reviewRequest)))
                .andExpect(status().isBadRequest()); // Should trigger MethodArgumentNotValidException
    }

    @Test
    void getReviewsByProperty_ShouldReturn200AndList() throws Exception {
        when(reviewService.getReviewsByProperty(anyString(), anyBoolean(), any())).thenReturn(List.of(reviewResponse));

        mockMvc.perform(get("/api/v1/reviews/property/prop1")
                .param("onlyApproved", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].propertyId").value("prop1"));
    }

    @Test
    void getReviewsByUser_ShouldReturn200AndList() throws Exception {
        when(reviewService.getReviewsByUser(anyString())).thenReturn(List.of(reviewResponse));

        mockMvc.perform(get("/api/v1/reviews/user/user1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].reviewerId").value("user1"));
    }
}
