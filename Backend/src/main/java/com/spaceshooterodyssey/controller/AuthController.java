
package com.spaceshooterodyssey.controller;

import org.springframework.web.bind.annotation.*;

import com.spaceshooterodyssey.dto.LoginRequest;
import com.spaceshooterodyssey.dto.LoginResponse;
import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.service.PlayerService;
import com.spaceshooterodyssey.security.JwtService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final PlayerService playerService;
    private final JwtService jwtService;

    public AuthController(PlayerService playerService,
                        JwtService jwtService) {
        this.playerService = playerService;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        Player player = playerService.loginPlayer(
                request.getEmail(),
                request.getPassword()
        );

        String token = jwtService.generateToken(player.getEmail());

        return new LoginResponse(
                token,
                player.getUsername(),
                player.getEmail()
        );
    }
}
