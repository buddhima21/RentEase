package com.rentease.modules.wallet;

import com.rentease.modules.wallet.model.BankCard;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class BankCardController {
    private final BankCardService bankCardService;

    @GetMapping("/{ownerId}")
    public ResponseEntity<List<BankCard>> getCards(@PathVariable String ownerId) {
        return ResponseEntity.ok(bankCardService.getCards(ownerId));
    }

    @PostMapping
    public ResponseEntity<BankCard> saveCard(@RequestBody BankCard bankCard) {
        return ResponseEntity.ok(bankCardService.saveCard(bankCard));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BankCard> updateCard(@PathVariable String id, @RequestBody BankCard bankCardDetails) {
        return ResponseEntity.ok(bankCardService.updateCard(id, bankCardDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(@PathVariable String id) {
        bankCardService.deleteCard(id);
        return ResponseEntity.ok().build();
    }
}
