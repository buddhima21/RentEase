package com.rentease.modules.wallet;

import com.rentease.modules.wallet.model.BankCard;
import com.rentease.modules.wallet.repository.BankCardRepository;
import com.rentease.modules.wallet.model.Wallet;
import com.rentease.modules.wallet.model.WalletTransaction;
import com.rentease.modules.wallet.repository.WalletRepository;
import com.rentease.modules.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WalletService {
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final BankCardRepository bankCardRepository;

    public Wallet getOrCreateWallet(String ownerId) {
        return walletRepository.findByOwnerId(ownerId)
                .orElseGet(() -> walletRepository.save(Wallet.builder()
                        .ownerId(ownerId)
                        .balance(0.0)
                        .build()));
    }

    public Map<String, Object> getWalletWithCards(String ownerId) {
        Wallet wallet = getOrCreateWallet(ownerId);
        List<BankCard> cards = bankCardRepository.findByOwnerId(ownerId);

        Map<String, Object> map = new HashMap<>();
        map.put("id", wallet.getId());
        map.put("ownerId", wallet.getOwnerId());
        map.put("balance", wallet.getBalance());
        map.put("cards", cards);
        
        return map;
    }

    @Transactional
    public void addBalance(String ownerId, Double amount, String description) {
        Wallet wallet = getOrCreateWallet(ownerId);
        wallet.setBalance(wallet.getBalance() + amount);
        walletRepository.save(wallet);

        transactionRepository.save(WalletTransaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type("DEPOSIT")
                .description(description)
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Transactional
    public void withdraw(String ownerId, Double amount, String cardId) throws Exception {
        Wallet wallet = getOrCreateWallet(ownerId);
        if (wallet.getBalance() < amount) {
            throw new Exception("Insufficient balance");
        }
        BankCard card = bankCardRepository.findById(cardId)
                .orElseGet(() -> bankCardRepository.findByCardNumberAndOwnerId(cardId, ownerId).orElse(null));
        if (card == null || card.getCardNumber() == null) {
            throw new Exception("Selected bank card is invalid");
        }
        if (!card.getOwnerId().equals(ownerId)) {
            throw new Exception("Card doesn't belong to wallet owner");
        }

        wallet.setBalance(wallet.getBalance() - amount);
        walletRepository.save(wallet);

        transactionRepository.save(WalletTransaction.builder()
                .walletId(wallet.getId())
                .amount(amount)
                .type("WITHDRAWAL")
                .description("Withdrawal to card ending in " + card.getCardNumber().substring(Math.max(0, card.getCardNumber().length() - 4)))
                .timestamp(LocalDateTime.now())
                .build());
    }

    // updateCard removed as it's governed by BankCardController

    public List<WalletTransaction> getTransactions(String ownerId) {
        Wallet wallet = getOrCreateWallet(ownerId);
        return transactionRepository.findByWalletIdOrderByTimestampDesc(wallet.getId());
    }
}
