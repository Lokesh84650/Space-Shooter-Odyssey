
package com.spaceshooterodyssey.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.spaceshooterodyssey.model.GameSession;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.service.GameSessionService;
import com.spaceshooterodyssey.service.PlayerProfileService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/game-sessions")
public class GameSessionController {

    private final GameSessionService gameSessionService;
    private final PlayerProfileService playerProfileService;

    public GameSessionController(
            GameSessionService gameSessionService,
            PlayerProfileService playerProfileService) {

        this.gameSessionService = gameSessionService;
        this.playerProfileService = playerProfileService;
    }

    // Start a new game session
    @PostMapping("/start")
    public GameSession startSession(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody StartGameSessionRequest request) {

        PlayerProfile player =
                playerProfileService.getPlayerProfile(email);

        return gameSessionService.startSession(
                player,
                request.getMissionId(),
                request.getSelectedShipId()
        );
    }

    // Complete an existing game session
    @PostMapping("/{sessionId}/complete")
    public GameSession completeSession(
            @AuthenticationPrincipal String email,
            @PathVariable String sessionId,
            @Valid @RequestBody CompleteGameSessionRequest request) {

        PlayerProfile player =
                playerProfileService.getPlayerProfile(email);

        return gameSessionService.completeSession(
                sessionId,
                player,
                request.getScore(),
                request.getEnemiesDefeated(),
                request.getBossesDefeated(),
                request.getDamageTaken(),
                request.getResult()
        );
    }

    // Get authenticated player's game history
    @GetMapping("/history")
    public java.util.List<GameSession> getGameHistory(
            @AuthenticationPrincipal String email) {

        PlayerProfile player =
                playerProfileService.getPlayerProfile(email);

        return gameSessionService.getGameHistory(player);
    }

    // Request DTO for starting a game
    public static class StartGameSessionRequest {

        @NotBlank(message = "Mission ID is required")
        @Size(max = 100, message = "Mission ID is too long")
        private String missionId;

        @NotBlank(message = "Selected ship ID is required")
        @Size(max = 100, message = "Selected ship ID is too long")
        private String selectedShipId;

        public String getMissionId() {
            return missionId;
        }

        public void setMissionId(String missionId) {
            this.missionId = missionId;
        }

        public String getSelectedShipId() {
            return selectedShipId;
        }

        public void setSelectedShipId(String selectedShipId) {
            this.selectedShipId = selectedShipId;
        }
    }

    // Request DTO for completing a game
    public static class CompleteGameSessionRequest {

        @Min(value = 0, message = "Score cannot be negative")
        @Max(value = 10000000, message = "Score exceeds the allowed limit")
        private int score;

        @Min(value = 0, message = "Enemies defeated cannot be negative")
        @Max(value = 10000, message = "Enemy count exceeds the allowed limit")
        private int enemiesDefeated;

        @Min(value = 0, message = "Bosses defeated cannot be negative")
        @Max(value = 100, message = "Boss count exceeds the allowed limit")
        private int bossesDefeated;

        @Min(value = 0, message = "Damage taken cannot be negative")
        @Max(value = 1000000, message = "Damage exceeds the allowed limit")
        private int damageTaken;

        @NotBlank(message = "Game result is required")
        @Pattern(
                regexp = "COMPLETED|FAILED",
                message = "Result must be COMPLETED or FAILED"
        )
        private String result;

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public int getEnemiesDefeated() {
            return enemiesDefeated;
        }

        public void setEnemiesDefeated(int enemiesDefeated) {
            this.enemiesDefeated = enemiesDefeated;
        }

        public int getBossesDefeated() {
            return bossesDefeated;
        }

        public void setBossesDefeated(int bossesDefeated) {
            this.bossesDefeated = bossesDefeated;
        }

        public int getDamageTaken() {
            return damageTaken;
        }

        public void setDamageTaken(int damageTaken) {
            this.damageTaken = damageTaken;
        }

        public String getResult() {
            return result;
        }

        public void setResult(String result) {
            this.result = result;
        }
    }
}
