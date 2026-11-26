
package com.spaceshooterodyssey.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.spaceshooterodyssey.model.GameSession;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.service.GameSessionService;
import com.spaceshooterodyssey.service.PlayerProfileService;

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

    @PostMapping("/start")
    public GameSession startSession(
            @AuthenticationPrincipal String email,
            @RequestBody StartGameSessionRequest request) {

        PlayerProfile player =
                playerProfileService.getPlayerProfile(email);

        return gameSessionService.startSession(
                player,
                request.getMissionId(),
                request.getSelectedShipId()
        );
    }

    @PostMapping("/{sessionId}/complete")
    public GameSession completeSession(
            @AuthenticationPrincipal String email,
            @PathVariable String sessionId,
            @RequestBody CompleteGameSessionRequest request) {

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

@GetMapping("/history")
public java.util.List<GameSession> getGameHistory(
        @AuthenticationPrincipal String email) {

    PlayerProfile player =
            playerProfileService.getPlayerProfile(email);

    return gameSessionService.getGameHistory(player);
}


    public static class StartGameSessionRequest {

        private String missionId;
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

    public static class CompleteGameSessionRequest {

        private int score;
        private int enemiesDefeated;
        private int bossesDefeated;
        private int damageTaken;
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
