
package com.spaceshooterodyssey.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.service.PlayerProfileService;

@RestController
@RequestMapping("/api/player")
public class PlayerProfileController {

    private final PlayerProfileService playerProfileService;

    public PlayerProfileController(PlayerProfileService playerProfileService) {
        this.playerProfileService = playerProfileService;
    }

    @GetMapping("/profile")
    public PlayerProfile getPlayerProfile(
            @AuthenticationPrincipal String email) {

        return playerProfileService.getPlayerProfile(email);
    }
}
