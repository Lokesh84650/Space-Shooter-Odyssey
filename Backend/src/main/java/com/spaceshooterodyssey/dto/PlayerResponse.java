
package com.spaceshooterodyssey.dto;

public class PlayerResponse {

    private Long id;
    private String username;
    private String email;
    private int level;
    private int totalScore;
    private int credits;

    public PlayerResponse(Long id, String username, String email,
                int level, int totalScore, int credits) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.level = level;
        this.totalScore = totalScore;
        this.credits = credits;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public int getLevel() {
        return level;
    }

    public int getTotalScore() {
        return totalScore;
    }

    public int getCredits() {
        return credits;
    }
}
