
package com.spaceshooterodyssey.service;

import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.repository.PlayerProfileRepository;
import com.spaceshooterodyssey.repository.PlayerRepository;

@Service
public class PlayerProfileService {

    private final PlayerProfileRepository playerProfileRepository;
    private final PlayerRepository playerRepository;

    public PlayerProfileService(
            PlayerProfileRepository playerProfileRepository,
            PlayerRepository playerRepository) {

        this.playerProfileRepository = playerProfileRepository;
        this.playerRepository = playerRepository;
    }

    public PlayerProfile getPlayerProfile(String email) {

        Player player = playerRepository.findByEmail(email);

        if (player == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated player not found"
            );
        }

        return playerProfileRepository.findByPlayer_Email(email)
                .orElseGet(() -> {

                    PlayerProfile profile = new PlayerProfile();

                    profile.setPlayer(player);
                    profile.setPlayerName(player.getUsername());
                    profile.setLevel(player.getLevel());
                    profile.setTotalScore(player.getTotalScore());
                    profile.setCredits(player.getCredits());

                    return playerProfileRepository.save(profile);
                });
    }
}
