
package com.spaceshooterodyssey.model;

import jakarta.persistence.*;
import com.spaceshooterodyssey.entity.Player;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "player_profiles")
public class PlayerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
        @JsonIgnore
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", unique = true)
    private Player player;

    private String playerName = "Pilot One";

    private int level = 1;

    private int currentXp = 0;

    private long totalScore = 0;

    private long bestScore = 0;

    private int credits = 100;

    private int energyCores = 0;

    private int missionsCompleted = 0;

    private String selectedShip = "Interceptor";

    private int shipHealth = 100;

    public PlayerProfile() {
    }

    public Long getId() {
        return id;
    }

    public Player getPlayer() {
    return player;
}

public void setPlayer(Player player) {
    this.player = player;
}
    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getCurrentXp() {
        return currentXp;
    }

    public void setCurrentXp(int currentXp) {
        this.currentXp = currentXp;
    }

    public long getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(long totalScore) {
        this.totalScore = totalScore;
    }

    public long getBestScore() {
        return bestScore;
    }

    public void setBestScore(long bestScore) {
        this.bestScore = bestScore;
    }

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public int getEnergyCores() {
        return energyCores;
    }

    public void setEnergyCores(int energyCores) {
        this.energyCores = energyCores;
    }

    public int getMissionsCompleted() {
        return missionsCompleted;
    }

    public void setMissionsCompleted(int missionsCompleted) {
        this.missionsCompleted = missionsCompleted;
    }

    public String getSelectedShip() {
        return selectedShip;
    }

    public void setSelectedShip(String selectedShip) {
        this.selectedShip = selectedShip;
    }

    public int getShipHealth() {
        return shipHealth;
    }

    public void setShipHealth(int shipHealth) {
        this.shipHealth = shipHealth;
    }
}
