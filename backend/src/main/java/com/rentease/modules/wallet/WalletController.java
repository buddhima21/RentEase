package com.rentease.modules.wallet;

import com.rentease.modules.wallet.model.WalletTransaction;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {
    private final WalletService walletService;

    @GetMapping("/{ownerId}")
    public ResponseEntity<Map<String, Object>> getWallet(@PathVariable String ownerId) {
        return ResponseEntity.ok(walletService.getWalletWithCards(ownerId));
    }

    // updateCard removed from here as BankCardController handles it

    @PostMapping("/{ownerId}/withdraw")
    public ResponseEntity<?> withdraw(@PathVariable String ownerId, @RequestBody Map<String, Object> request) {
        try {
            Double amount = Double.valueOf(request.get("amount").toString());
            String cardId = (String) request.get("cardId");
            walletService.withdraw(ownerId, amount, cardId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Withdrawal successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/{ownerId}/transactions")
    public ResponseEntity<List<WalletTransaction>> getTransactions(@PathVariable String ownerId) {
        return ResponseEntity.ok(walletService.getTransactions(ownerId));
    }
}
