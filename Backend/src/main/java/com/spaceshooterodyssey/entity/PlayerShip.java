
package com.spaceshooterodyssey.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "player_ships",
    uniqueConstraints = @UniqueConstraint(
        columnNames = {"player_id", "spaceship_id"}
    )
)
public class PlayerShip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "player_id", nullable = false)
    private Player player;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "spaceship_id", nullable = false)
    private Spaceship spaceship;

    private int upgradeLevel = 1;

    private int healthBonus = 0;

    private int attackBonus = 0;

    private int speedBonus = 0;

    public PlayerShip() {
    }

    public PlayerShip(Player player, Spaceship spaceship) {
        this.player = player;
        this.spaceship = spaceship;
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

    public Spaceship getSpaceship() {
        return spaceship;
    }

    public void setSpaceship(Spaceship spaceship) {
        this.spaceship = spaceship;
    }

    public int getUpgradeLevel() {
        return upgradeLevel;
    }

    public void setUpgradeLevel(int upgradeLevel) {
        this.upgradeLevel = upgradeLevel;
    }

    public int getHealthBonus() {
        return healthBonus;
    }

    public void setHealthBonus(int healthBonus) {
        this.healthBonus = healthBonus;
    }

    public int getAttackBonus() {
        return attackBonus;
    }

    public void setAttackBonus(int attackBonus) {
        this.attackBonus = attackBonus;
    }

    public int getSpeedBonus() {
        return speedBonus;
    }

    public void setSpeedBonus(int speedBonus) {
        this.speedBonus = speedBonus;
    }
}
