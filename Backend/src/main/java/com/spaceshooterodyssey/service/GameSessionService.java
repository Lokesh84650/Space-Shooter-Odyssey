
package com.spaceshooterodyssey.service;

import java.time.LocalDateTime;
import java.time.Duration;
import java.util.UUID;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.spaceshooterodyssey.model.GameSession;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.repository.GameSessionRepository;

@Service
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;

    public GameSessionService(
            GameSessionRepository gameSessionRepository) {
        this.gameSessionRepository = gameSessionRepository;
    }

    @Transactional
    public GameSession startSession(
            PlayerProfile player,
            String missionId,
            String selectedShipId) {

        if (missionId == null || missionId.isBlank()) {
            throw new IllegalArgumentException("Mission ID is required");
        }

        if (selectedShipId == null || selectedShipId.isBlank()) {
            throw new IllegalArgumentException("Selected ship is required");
        }

        GameSession session = new GameSession();

        session.setSessionId(UUID.randomUUID().toString());
        session.setPlayerProfile(player);
        session.setMissionId(missionId);
        session.setSelectedShipId(selectedShipId);
        session.setStatus("IN_PROGRESS");
        session.setStartTime(LocalDateTime.now());
        session.setResult("IN_PROGRESS");

        return gameSessionRepository.save(session);
    }

    @Transactional
    public GameSession completeSession(
            String sessionId,
            PlayerProfile player,
            int score,
            int enemiesDefeated,
            int bossesDefeated,
            int damageTaken,
            String result) {

        if (!gameSessionRepository.existsBySessionIdAndPlayerProfile_Id(
                sessionId, player.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Game session not found for this player"
            );
        }

        GameSession session = gameSessionRepository
                .findBySessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Game session not found"
                ));

        if (!"IN_PROGRESS".equals(session.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This game session has already ended"
            );
        }

        if (score < 0 || enemiesDefeated < 0 ||
                bossesDefeated < 0 || damageTaken < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mission statistics cannot be negative"
            );
        }

        if (!"COMPLETED".equals(result) && !"FAILED".equals(result)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Result must be COMPLETED or FAILED"
            );
        }

        LocalDateTime endTime = LocalDateTime.now();

        long duration = Duration.between(
                session.getStartTime(),
                endTime
        ).getSeconds();

        int xpEarned = 0;
        int creditsEarned = 0;
        int starsAwarded = 0;

        if ("COMPLETED".equals(result)) {
            xpEarned = score / 10;
            creditsEarned = (enemiesDefeated * 2)
                    + (bossesDefeated * 20);

            if (score >= 1000) {
                starsAwarded = 3;
            } else if (score >= 500) {
                starsAwarded = 2;
            } else {
                starsAwarded = 1;
            }

            player.setMissionsCompleted(
                    player.getMissionsCompleted() + 1
            );

            player.setCurrentXp(
                    player.getCurrentXp() + xpEarned
            );

            player.setCredits(
                    player.getCredits() + creditsEarned
            );
        }

        player.setTotalScore(
                player.getTotalScore() + score
        );

        if (score > player.getBestScore()) {
            player.setBestScore(score);
        }

        session.setEndTime(endTime);
        session.setDurationSeconds((int) duration);
        session.setScore(score);
        session.setEnemiesDefeated(enemiesDefeated);
        session.setBossesDefeated(bossesDefeated);
        session.setDamageTaken(damageTaken);
        session.setXpEarned(xpEarned);
        session.setCreditsEarned(creditsEarned);
        session.setStarsAwarded(starsAwarded);
        session.setResult(result);
        session.setStatus(result);

        return gameSessionRepository.save(session);
    }

    @Transactional(readOnly = true)
public List<GameSession> getGameHistory(PlayerProfile player) {

    return gameSessionRepository
            .findAllByPlayerProfile_IdOrderByStartTimeDesc(
                    player.getId()
            );
}
}
