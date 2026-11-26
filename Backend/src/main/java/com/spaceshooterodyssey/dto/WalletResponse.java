
package com.spaceshooterodyssey.dto;

public class WalletResponse {

    private Long playerId;
    private int balance;
    private String message;

    public WalletResponse() {
    }

    public WalletResponse(Long playerId, int balance, String message) {
        this.playerId = playerId;
        this.balance = balance;
        this.message = message;
    }

    public Long getPlayerId() {
        return playerId;
    }

    public int getBalance() {
        return balance;
    }

    public String getMessage() {
        return message;
    }
}
