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
@Document(collection = "bank_cards")
public class BankCard {
    @Id
    private String id;
    private String ownerId;
    private String cardHolderName;
    private String cardNumber;
    private String expiryDate;
}
