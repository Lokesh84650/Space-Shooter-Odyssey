
package com.spaceshooterodyssey.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.spaceshooterodyssey.dto.RegisterRequest;
import com.spaceshooterodyssey.dto.PlayerResponse;
import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.service.PlayerService;

@RestController
@RequestMapping("/api/players")
public class PlayerController {

    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping("/register")
    public PlayerResponse registerPlayer(
            @RequestBody RegisterRequest request) {

        if (request.getUsername() == null ||
            request.getUsername().isBlank() ||
            request.getEmail() == null ||
            request.getEmail().isBlank() ||
            request.getPassword() == null ||
            request.getPassword().isBlank()) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Username, email and password are required!"
            );
        }

        Player player = new Player(
            request.getUsername(),
            request.getEmail(),
            request.getPassword()
        );

        Player savedPlayer = playerService.registerPlayer(player);

        return new PlayerResponse(
            savedPlayer.getId(),
            savedPlayer.getUsername(),
            savedPlayer.getEmail(),
            savedPlayer.getLevel(),
            savedPlayer.getTotalScore(),
            savedPlayer.getCredits()
        );
    }
}

