
package com.spaceshooterodyssey.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshooterodyssey.entity.WalletTransaction;

public interface WalletTransactionRepository
        extends JpaRepository<WalletTransaction, Long> {

    boolean existsByPlayer_IdAndReferenceId(
            Long playerId,
            String referenceId
    );

    List<WalletTransaction> findByPlayer_IdOrderByCreatedAtDesc(
            Long playerId
    );
}
