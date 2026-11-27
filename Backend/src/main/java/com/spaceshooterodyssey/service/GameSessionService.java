
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
import com.spaceshooterodyssey.entity.Mission;
import com.spaceshooterodyssey.repository.GameSessionRepository;
import com.spaceshooterodyssey.repository.MissionRepository;
import com.spaceshooterodyssey.repository.PlayerProfileRepository;
import com.spaceshooterodyssey.repository.WalletTransactionRepository;

@Service
public class GameSessionService {

    private final GameSessionRepository gameSessionRepository;
    private final MissionRepository missionRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletService walletService;

    public GameSessionService(
            GameSessionRepository gameSessionRepository,
            MissionRepository missionRepository,
            PlayerProfileRepository playerProfileRepository,
            WalletTransactionRepository walletTransactionRepository,
            WalletService walletService) {

        this.gameSessionRepository = gameSessionRepository;
        this.missionRepository = missionRepository;
        this.playerProfileRepository = playerProfileRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.walletService = walletService;
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

        Mission mission = missionRepository
                .findByMissionCodeAndActiveTrue(missionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mission not found"
                ));

        GameSession session = new GameSession();

        session.setSessionId(UUID.randomUUID().toString());
        session.setPlayerProfile(player);
        session.setMissionId(mission.getMissionCode());
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

        GameSession session = gameSessionRepository
                .findBySessionId(sessionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Game session not found"
                ));

        if (!session.getPlayerProfile().getId().equals(player.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "This session does not belong to this player"
            );
        }

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

        Mission mission = missionRepository
                .findByMissionCodeAndActiveTrue(session.getMissionId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mission configuration not found"
                ));

        LocalDateTime endTime = LocalDateTime.now();

        long duration = Duration.between(
                session.getStartTime(),
                endTime
        ).getSeconds();

        int xpEarned = 0;
        int creditsEarned = 0;
        int starsAwarded = 0;

        if ("COMPLETED".equals(result)) {

            String email = player.getPlayer().getEmail();
            Long playerId = player.getPlayer().getId();

            String missionReference =
                    "MISSION_REWARD:" + mission.getMissionCode();

            boolean firstMissionReward =
                    !walletTransactionRepository
                            .existsByPlayer_IdAndReferenceId(
                                    playerId,
                                    missionReference
                            );

            // Mission reward is taken from the database.
            if (firstMissionReward) {

                int missionCredits = mission.getRewardCredits();

                if (missionCredits > 0) {
                    walletService.credit(
                            email,
                            missionCredits,
                            "MISSION_REWARD",
                            "MISSION_COMPLETION",
                            missionReference
                    );

                    creditsEarned = Math.addExact(
                            creditsEarned,
                            missionCredits
                    );
                }

                xpEarned = mission.getRewardXp();

                player.setMissionsCompleted(
                        player.getMissionsCompleted() + 1
                );

                player.setCurrentXp(
                        player.getCurrentXp() + xpEarned
                );
            }

            // Preserve the existing enemy reward: 2 credits per enemy.
            int enemyReward = Math.multiplyExact(
                    enemiesDefeated, 2
            );

            if (enemyReward > 0) {
                walletService.credit(
                        email,
                        enemyReward,
                        "MISSION_REWARD",
                        "ENEMY_DEFEATS",
                        "ENEMY_REWARD:" + sessionId
                );

                creditsEarned = Math.addExact(
                        creditsEarned,
                        enemyReward
                );
            }

            // Boss reward: 20 credits per boss, once per mission.
            if (bossesDefeated > 0 &&
                    mission.getBossId() != null &&
                    !mission.getBossId().isBlank()) {

                String bossReference =
                        "BOSS_REWARD:" + mission.getMissionCode();

                boolean bossRewardAlreadyGiven =
                        walletTransactionRepository
                                .existsByPlayer_IdAndReferenceId(
                                        playerId,
                                        bossReference
                                );

                if (!bossRewardAlreadyGiven) {

                    int bossReward = Math.multiplyExact(
                            bossesDefeated, 20
                    );

                    walletService.credit(
                            email,
                            bossReward,
                            "BOSS_REWARD",
                            "BOSS_DEFEAT",
                            bossReference
                    );

                    creditsEarned = Math.addExact(
                            creditsEarned,
                            bossReward
                    );
                }
            }

            int newBalance = walletService
                    .getWallet(email)
                    .getBalance();

            player.setCredits(newBalance);
            playerProfileRepository.save(player);

            if (score >= 1000) {
                starsAwarded = 3;
            } else if (score >= 500) {
                starsAwarded = 2;
            } else {
                starsAwarded = 1;
            }
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
