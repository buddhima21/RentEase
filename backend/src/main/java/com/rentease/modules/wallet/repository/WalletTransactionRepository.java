package com.rentease.modules.wallet.repository;

import com.rentease.modules.wallet.model.WalletTransaction;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface WalletTransactionRepository extends MongoRepository<WalletTransaction, String> {
    List<WalletTransaction> findByWalletIdOrderByTimestampDesc(String walletId);
}
