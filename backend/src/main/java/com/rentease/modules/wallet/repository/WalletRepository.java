package com.rentease.modules.wallet.repository;

import com.rentease.modules.wallet.model.Wallet;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface WalletRepository extends MongoRepository<Wallet, String> {
    Optional<Wallet> findByOwnerId(String ownerId);
}
