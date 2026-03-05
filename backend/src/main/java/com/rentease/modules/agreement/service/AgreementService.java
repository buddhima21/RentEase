package com.rentease.modules.agreement.service;

import com.rentease.modules.agreement.dto.AgreementRequest;
import com.rentease.modules.agreement.dto.AgreementResponse;
import com.rentease.modules.agreement.model.Agreement;
import com.rentease.modules.agreement.repository.AgreementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AgreementService {

    private final AgreementRepository agreementRepository;

    public AgreementResponse createAgreement(AgreementRequest request) {
        Agreement agreement = Agreement.builder()
                .bookingId(request.getBookingId())
                .tenantId(request.getTenantId())
                .ownerId(request.getOwnerId())
                .propertyId(request.getPropertyId())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .monthlyRent(request.getMonthlyRent())
                .terms(request.getTerms())
                .build();

        Agreement saved = agreementRepository.save(agreement);
        return mapToResponse(saved);
    }

    public List<AgreementResponse> getByBooking(String bookingId) {
        return agreementRepository.findByBookingId(bookingId)
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    private AgreementResponse mapToResponse(Agreement a) {
        return AgreementResponse.builder()
                .id(a.getId())
                .bookingId(a.getBookingId())
                .tenantId(a.getTenantId())
                .ownerId(a.getOwnerId())
                .propertyId(a.getPropertyId())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .monthlyRent(a.getMonthlyRent())
                .terms(a.getTerms())
                .signedByTenant(a.isSignedByTenant())
                .signedByOwner(a.isSignedByOwner())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
