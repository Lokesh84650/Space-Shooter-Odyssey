
package com.spaceshooterodyssey.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spaceshooterodyssey.dto.WalletResponse;
import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.entity.WalletTransaction;
import com.spaceshooterodyssey.repository.PlayerRepository;
import com.spaceshooterodyssey.repository.WalletTransactionRepository;

@Service
public class WalletService {

    private final PlayerRepository playerRepository;
    private final WalletTransactionRepository transactionRepository;

    public WalletService(
            PlayerRepository playerRepository,
            WalletTransactionRepository transactionRepository) {
        this.playerRepository = playerRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public WalletResponse credit(
            String email,
            int amount,
            String transactionType,
            String source,
            String referenceId) {

        validateTransaction(amount, transactionType, source, referenceId);

        Player player = getLockedPlayer(email);

        if (transactionRepository.existsByPlayer_IdAndReferenceId(
                player.getId(), referenceId)) {
            throw new IllegalArgumentException(
                    "This transaction has already been processed.");
        }

        int balanceBefore = player.getCredits();
        int balanceAfter = Math.addExact(balanceBefore, amount);

        player.setCredits(balanceAfter);
        playerRepository.save(player);

        saveTransaction(
                player, transactionType, source, referenceId,
                amount, balanceBefore, balanceAfter);

        return new WalletResponse(
                player.getId(), balanceAfter, "Credits added successfully.");
    }

    @Transactional
    public WalletResponse debit(
            String email,
            int amount,
            String transactionType,
            String source,
            String referenceId) {

        validateTransaction(amount, transactionType, source, referenceId);

        Player player = getLockedPlayer(email);

        if (transactionRepository.existsByPlayer_IdAndReferenceId(
                player.getId(), referenceId)) {
            throw new IllegalArgumentException(
                    "This transaction has already been processed.");
        }

        int balanceBefore = player.getCredits();

        if (balanceBefore < amount) {
            throw new IllegalArgumentException("Insufficient credits.");
        }

        int balanceAfter = balanceBefore - amount;

        player.setCredits(balanceAfter);
        playerRepository.save(player);

        saveTransaction(
                player, transactionType, source, referenceId,
                -amount, balanceBefore, balanceAfter);

        return new WalletResponse(
                player.getId(), balanceAfter, "Purchase completed successfully.");
    }

    @Transactional(readOnly = true)
    public WalletResponse getWallet(String email) {
        Player player = playerRepository.findByEmail(email);

        if (player == null) {
            throw new IllegalArgumentException("Player not found.");
        }

        return new WalletResponse(
                player.getId(), player.getCredits(), "Wallet loaded successfully.");
    }

    @Transactional(readOnly = true)
    public List<WalletTransaction> getHistory(String email) {
        Player player = playerRepository.findByEmail(email);

        if (player == null) {
            throw new IllegalArgumentException("Player not found.");
        }

        return transactionRepository.findByPlayer_IdOrderByCreatedAtDesc(
                player.getId());
    }

    private Player getLockedPlayer(String email) {
        Player player = playerRepository.findByEmailForUpdate(email);

        if (player == null) {
            throw new IllegalArgumentException("Player not found.");
        }

        return player;
    }

    private void validateTransaction(
            int amount,
            String transactionType,
            String source,
            String referenceId) {

        if (amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero.");
        }

        if (transactionType == null || transactionType.isBlank()
                || source == null || source.isBlank()
                || referenceId == null || referenceId.isBlank()) {
            throw new IllegalArgumentException(
                    "Transaction type, source and reference ID are required.");
        }

        if (referenceId.length() > 100) {
            throw new IllegalArgumentException(
                    "Reference ID cannot exceed 100 characters.");
        }
    }

    private void saveTransaction(
            Player player,
            String transactionType,
            String source,
            String referenceId,
            int amount,
            int balanceBefore,
            int balanceAfter) {

        WalletTransaction transaction = new WalletTransaction();

        transaction.setPlayer(player);
        transaction.setTransactionType(transactionType);
        transaction.setSource(source);
        transaction.setReferenceId(referenceId);
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setStatus("SUCCESS");

        transactionRepository.save(transaction);
    }
}
