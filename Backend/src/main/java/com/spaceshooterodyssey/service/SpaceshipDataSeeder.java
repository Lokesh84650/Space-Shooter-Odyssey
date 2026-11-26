
package com.spaceshooterodyssey.service;

import com.spaceshooterodyssey.entity.Spaceship;
import com.spaceshooterodyssey.repository.SpaceshipRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class SpaceshipDataSeeder implements CommandLineRunner {

    private final SpaceshipRepository spaceshipRepository;

    public SpaceshipDataSeeder(SpaceshipRepository spaceshipRepository) {
        this.spaceshipRepository = spaceshipRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {

        addShip("NOVA-01", "Interceptor",
                "Agility Fighter", 100, 10, 15, 0);

        addShip("VOLT-02", "Striker",
                "Assault Fighter", 110, 20, 12, 500);

        addShip("AEGIS-03", "Guardian",
                "Defense Specialist", 160, 15, 8, 800);

        addShip("PULSE-04", "Support Craft",
                "Tactical Support", 130, 18, 10, 1200);

        addShip("OMEGA-05", "Experimental Ship",
                "Advanced Prototype", 150, 30, 13, 2000);
    }

    private void addShip(
            String code,
            String name,
            String description,
            int health,
            int attack,
            int speed,
            int price) {

        boolean exists = spaceshipRepository.findAll()
                .stream()
                .anyMatch(ship -> code.equals(ship.getShipCode()));

        if (!exists) {
            Spaceship ship = new Spaceship(
                    code, name, description,
                    health, attack, speed, price
            );

            spaceshipRepository.save(ship);
            System.out.println("Added spaceship: " + name);
        }
    }
}
