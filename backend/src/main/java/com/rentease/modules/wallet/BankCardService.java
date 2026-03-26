package com.rentease.modules.wallet;

import com.rentease.modules.wallet.model.BankCard;
import com.rentease.modules.wallet.repository.BankCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BankCardService {
    private final BankCardRepository bankCardRepository;

    public List<BankCard> getCards(String ownerId) {
        return bankCardRepository.findByOwnerId(ownerId);
    }

    public BankCard saveCard(BankCard bankCard) {
        if (bankCard.getId() != null && bankCard.getId().trim().isEmpty()) {
            bankCard.setId(null);
        }
        return bankCardRepository.save(bankCard);
    }

    public BankCard updateCard(String id, BankCard bankCardDetails) {
        return bankCardRepository.findById(id).map(card -> {
            card.setCardHolderName(bankCardDetails.getCardHolderName());
            card.setCardNumber(bankCardDetails.getCardNumber());
            card.setExpiryDate(bankCardDetails.getExpiryDate());
            return bankCardRepository.save(card);
        }).orElseThrow(() -> new IllegalArgumentException("Card not found"));
    }

    public void deleteCard(String id) {
        bankCardRepository.deleteById(id);
    }
}
