
package com.spaceshooterodyssey.service;

import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.entity.PlayerShip;
import com.spaceshooterodyssey.entity.Spaceship;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.repository.PlayerProfileRepository;
import com.spaceshooterodyssey.repository.PlayerShipRepository;
import com.spaceshooterodyssey.repository.SpaceshipRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class SpaceshipService {

    private final PlayerProfileRepository playerProfileRepository;
    private final PlayerShipRepository playerShipRepository;
    private final SpaceshipRepository spaceshipRepository;
    private final WalletService walletService;

    public SpaceshipService(
        PlayerProfileRepository playerProfileRepository,
        PlayerShipRepository playerShipRepository,
        SpaceshipRepository spaceshipRepository,
        WalletService walletService) {
    this.playerProfileRepository = playerProfileRepository;
    this.playerShipRepository = playerShipRepository;
    this.spaceshipRepository = spaceshipRepository;
    this.walletService = walletService;
}

    private PlayerProfile getProfile(String email) {
        return playerProfileRepository.findByPlayer_Email(email)
                .orElseThrow(() -> new RuntimeException("Player profile not found"));
    }

    private Player getPlayer(String email) {
        return getProfile(email).getPlayer();
    }

    private Spaceship getShip(Long shipId) {
        Spaceship ship = spaceshipRepository.findById(shipId)
                .orElseThrow(() -> new RuntimeException("Spaceship not found"));

        if (!ship.isActive()) {
            throw new RuntimeException("Spaceship is inactive");
        }
        return ship;
    }

    private void ensureStarterShip(Player player) {
        Spaceship starter = spaceshipRepository
                .findByShipCodeAndActiveTrue("NOVA-01")
                .orElseThrow(() -> new RuntimeException("Starter ship not found"));

        Optional<PlayerShip> ownership =
                playerShipRepository.findByPlayer_EmailAndSpaceship_Id(
                        player.getEmail(), starter.getId());

        if (ownership.isEmpty()) {
            playerShipRepository.save(new PlayerShip(player, starter));
        }

        if (player.getSpaceship() == null) {
            player.setSpaceship(starter);
        }
    }

    @Transactional
    public List<Map<String, Object>> getHangar(String email) {
        Player player = getPlayer(email);
        ensureStarterShip(player);

        List<Spaceship> ships = spaceshipRepository.findByActiveTrue();
        List<PlayerShip> ownedShips = playerShipRepository.findByPlayer_Email(email);

        Map<Long, PlayerShip> ownershipMap = new HashMap<>();
        for (PlayerShip owned : ownedShips) {
            ownershipMap.put(owned.getSpaceship().getId(), owned);
        }

        List<Map<String, Object>> result = new ArrayList<>();

        for (Spaceship ship : ships) {
            PlayerShip ownership = ownershipMap.get(ship.getId());

            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", ship.getId());
            data.put("shipCode", ship.getShipCode());
            data.put("shipName", ship.getShipName());
            data.put("description", ship.getDescription());
            data.put("health", ship.getHealth());
            data.put("attackPower", ship.getAttackPower());
            data.put("speed", ship.getSpeed());
            data.put("price", ship.getPrice());
            data.put("owned", ownership != null);
            data.put("equipped", player.getSpaceship() != null
                    && player.getSpaceship().getId().equals(ship.getId()));
            data.put("upgradeLevel",
                    ownership == null ? 0 : ownership.getUpgradeLevel());

            result.add(data);
        }

        return result;
    }
@Transactional
public Map<String, Object> purchaseShip(String email, Long shipId) {
    PlayerProfile profile = getProfile(email);
    Player player = profile.getPlayer();

    ensureStarterShip(player);
    Spaceship ship = getShip(shipId);

    if (playerShipRepository.existsByPlayer_EmailAndSpaceship_Id(email, shipId)) {
        throw new RuntimeException("You already own this ship");
    }

    if (ship.getPrice() <= 0) {
        throw new RuntimeException("This ship is available as a starter ship");
    }

    int remainingCredits = walletService.debit(
            email,
            ship.getPrice(),
            "SHIP_PURCHASE",
            "SPACESHIP",
            "SHIP_PURCHASE:" + shipId
    ).getBalance();

    profile.setCredits(remainingCredits);

    PlayerShip ownership = new PlayerShip(player, ship);
    playerShipRepository.save(ownership);

    return createResponse(
            "Spaceship purchased successfully",
            ship.getShipName(),
            remainingCredits
    );
}

    @Transactional
    public Map<String, Object> selectShip(String email, Long shipId) {
        Player player = getPlayer(email);
        ensureStarterShip(player);

        Spaceship ship = getShip(shipId);

        PlayerShip ownership = playerShipRepository
                .findByPlayer_EmailAndSpaceship_Id(email, shipId)
                .orElseThrow(() -> new RuntimeException(
                        "You must purchase this ship first"));

        player.setSpaceship(ship);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", "Spaceship equipped successfully");
        response.put("shipName", ship.getShipName());
        response.put("shipId", ship.getId());
        response.put("health", ship.getHealth() + ownership.getHealthBonus());
        response.put("attackPower", ship.getAttackPower() + ownership.getAttackBonus());
        response.put("speed", ship.getSpeed() + ownership.getSpeedBonus());

        return response;
    }
@Transactional
public Map<String, Object> upgradeShip(
        String email, Long shipId, String upgradeType) {

    PlayerProfile profile = getProfile(email);

    getShip(shipId);

    PlayerShip ownership = playerShipRepository
            .findByPlayer_EmailAndSpaceship_Id(email, shipId)
            .orElseThrow(() -> new RuntimeException(
                    "You must own this ship before upgrading"));

    if (ownership.getUpgradeLevel() >= 5) {
        throw new RuntimeException("Maximum upgrade level reached");
    }

    String type = upgradeType == null
            ? "" : upgradeType.trim().toUpperCase();

    switch (type) {
        case "HEALTH":
        case "ATTACK":
        case "SPEED":
            break;
        default:
            throw new RuntimeException(
                    "Invalid upgrade type. Use HEALTH, ATTACK or SPEED");
    }

    int upgradeCost = ownership.getUpgradeLevel() * 250;

    int remainingCredits = walletService.debit(
            email,
            upgradeCost,
            "SHIP_UPGRADE",
            "SPACESHIP_UPGRADE",
            "SHIP_UPGRADE:" + shipId + ":" + (ownership.getUpgradeLevel() + 1)
    ).getBalance();

    switch (type) {
        case "HEALTH":
            ownership.setHealthBonus(ownership.getHealthBonus() + 10);
            break;
        case "ATTACK":
            ownership.setAttackBonus(ownership.getAttackBonus() + 2);
            break;
        case "SPEED":
            ownership.setSpeedBonus(ownership.getSpeedBonus() + 1);
            break;
    }

    ownership.setUpgradeLevel(ownership.getUpgradeLevel() + 1);

    profile.setCredits(remainingCredits);

    playerShipRepository.save(ownership);

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("message", "Ship upgraded successfully");
    response.put("upgradeType", type);
    response.put("upgradeLevel", ownership.getUpgradeLevel());
    response.put("creditsSpent", upgradeCost);
    response.put("creditsRemaining", remainingCredits);

    return response;
}

    private Map<String, Object> createResponse(
            String message, String shipName, int credits) {

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("message", message);
        response.put("shipName", shipName);
        response.put("creditsRemaining", credits);

        return response;
    }
}
