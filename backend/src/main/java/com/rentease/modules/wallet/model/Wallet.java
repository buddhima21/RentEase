package com.rentease.modules.wallet.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "wallets")
public class Wallet {
    @Id
    private String id;
    private String ownerId;
    private Double balance;
    private String cardHolderName;
    private String cardNumber; // Stored as masked or encrypted in real app, here for simplicity
    private String expiryDate;
}
