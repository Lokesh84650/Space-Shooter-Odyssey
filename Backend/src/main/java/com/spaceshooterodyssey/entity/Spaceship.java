
package com.spaceshooterodyssey.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "spaceship",
    uniqueConstraints = @UniqueConstraint(columnNames = "ship_code")
)
public class Spaceship {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ship_code", nullable = false, unique = true)
    private String shipCode;

    @Column(nullable = false)
    private String shipName;

    private String description;

    private int health = 100;
    private int attackPower = 10;
    private int speed = 10;
    private int price = 0;
    private boolean active = true;

    public Spaceship() {
    }

    public Spaceship(
            String shipCode,
            String shipName,
            String description,
            int health,
            int attackPower,
            int speed,
            int price) {

        this.shipCode = shipCode;
        this.shipName = shipName;
        this.description = description;
        this.health = health;
        this.attackPower = attackPower;
        this.speed = speed;
        this.price = price;
    }

    public Long getId() {
        return id;
    }

    public String getShipCode() {
        return shipCode;
    }

    public void setShipCode(String shipCode) {
        this.shipCode = shipCode;
    }

    public String getShipName() {
        return shipName;
    }

    public void setShipName(String shipName) {
        this.shipName = shipName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getHealth() {
        return health;
    }

    public void setHealth(int health) {
        this.health = health;
    }

    public int getAttackPower() {
        return attackPower;
    }

    public void setAttackPower(int attackPower) {
        this.attackPower = attackPower;
    }

    public int getSpeed() {
        return speed;
    }

    public void setSpeed(int speed) {
        this.speed = speed;
    }

    public int getPrice() {
        return price;
    }

    public void setPrice(int price) {
        this.price = price;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
