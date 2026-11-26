
package com.spaceshooterodyssey.dto;

import java.time.LocalDateTime;

public class WalletTransactionResponse {

    private Long id;
    private String transactionType;
    private String source;
    private String referenceId;
    private int amount;
    private int balanceBefore;
    private int balanceAfter;
    private String status;
    private LocalDateTime createdAt;

    public WalletTransactionResponse(
            Long id,
            String transactionType,
            String source,
            String referenceId,
            int amount,
            int balanceBefore,
            int balanceAfter,
            String status,
            LocalDateTime createdAt) {

        this.id = id;
        this.transactionType = transactionType;
        this.source = source;
        this.referenceId = referenceId;
        this.amount = amount;
        this.balanceBefore = balanceBefore;
        this.balanceAfter = balanceAfter;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getTransactionType() {
        return transactionType;
    }

    public String getSource() {
        return source;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public int getAmount() {
        return amount;
    }

    public int getBalanceBefore() {
        return balanceBefore;
    }

    public int getBalanceAfter() {
        return balanceAfter;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

