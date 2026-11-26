
package com.spaceshooterodyssey.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;

import java.time.LocalDate;

@Entity
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private int level = 1;

    private int totalScore = 0;

    private int credits = 100;

    @ManyToOne
    @JoinColumn(name = "spaceship_id")
    private Spaceship spaceship;

    // Daily login reward tracking
    @Column(name = "last_daily_reward_date")
    private LocalDate lastDailyRewardDate;

    @Column(name = "consecutive_login_days", nullable = false)
    private int consecutiveLoginDays = 0;

    public Player() {
    }

    public Player(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public Spaceship getSpaceship() {
        return spaceship;
    }

    public void setSpaceship(Spaceship spaceship) {
        this.spaceship = spaceship;
    }

    public LocalDate getLastDailyRewardDate() {
        return lastDailyRewardDate;
    }

    public void setLastDailyRewardDate(LocalDate lastDailyRewardDate) {
        this.lastDailyRewardDate = lastDailyRewardDate;
    }

    public int getConsecutiveLoginDays() {
        return consecutiveLoginDays;
    }

    public void setConsecutiveLoginDays(int consecutiveLoginDays) {
        this.consecutiveLoginDays = consecutiveLoginDays;
    }
}
