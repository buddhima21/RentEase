package com.rentease.modules.wallet.repository;

import com.rentease.modules.wallet.model.BankCard;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankCardRepository extends MongoRepository<BankCard, String> {
    List<BankCard> findByOwnerId(String ownerId);
    Optional<BankCard> findByCardNumberAndOwnerId(String cardNumber, String ownerId);
}
