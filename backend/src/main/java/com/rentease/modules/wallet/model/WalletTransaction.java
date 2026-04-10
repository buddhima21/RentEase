package com.rentease.modules.wallet.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "wallet_transactions")
public class WalletTransaction {
    @Id
    private String id;
    private String walletId;
    private Double amount;
    private String type; // DEPOSIT, WITHDRAWAL
    private String description;
    private LocalDateTime timestamp;
}
