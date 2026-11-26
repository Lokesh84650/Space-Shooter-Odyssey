
package com.spaceshooterodyssey.controller;

import com.spaceshooterodyssey.service.SpaceshipService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ships")
@CrossOrigin(origins = "http://localhost:5173")
public class SpaceshipController {

    private final SpaceshipService spaceshipService;

    public SpaceshipController(SpaceshipService spaceshipService) {
        this.spaceshipService = spaceshipService;
    }

    // Display all available spaceships.
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getHangar(
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                spaceshipService.getHangar(email));
    }

    // Purchase a spaceship.
    @PostMapping("/{shipId}/purchase")
    public ResponseEntity<Map<String, Object>> purchaseShip(
            @PathVariable Long shipId,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                spaceshipService.purchaseShip(email, shipId));
    }

    // Equip an owned spaceship.
    @PostMapping("/{shipId}/select")
    public ResponseEntity<Map<String, Object>> selectShip(
            @PathVariable Long shipId,
            Authentication authentication) {

        String email = authentication.getName();

        return ResponseEntity.ok(
                spaceshipService.selectShip(email, shipId));
    }

    // Upgrade an owned spaceship.
    @PostMapping("/{shipId}/upgrade")
    public ResponseEntity<Map<String, Object>> upgradeShip(
            @PathVariable Long shipId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String email = authentication.getName();
        String upgradeType = request.get("upgradeType");

        return ResponseEntity.ok(
                spaceshipService.upgradeShip(
                        email, shipId, upgradeType));
    }
}
