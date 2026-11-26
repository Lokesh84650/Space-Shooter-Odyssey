package com.spaceshooterodyssey.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.repository.PlayerRepository;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    public Player registerPlayer(Player player) {

        if (playerRepository.existsByEmail(player.getEmail())) {
            throw new RuntimeException("Email already registered!");
        }

        String encodedPassword =
                passwordEncoder.encode(player.getPassword());

        player.setPassword(encodedPassword);

        return playerRepository.save(player);
    }
    
public Player loginPlayer(String email, String password) {

    Player player = playerRepository.findByEmail(email);

    if (player == null) {
        throw new RuntimeException("Invalid email or password!");
    }

    boolean passwordMatches = passwordEncoder.matches(
            password,
            player.getPassword()
    );

    if (!passwordMatches) {
        throw new RuntimeException("Invalid email or password!");
    }

    return player;
}

}
