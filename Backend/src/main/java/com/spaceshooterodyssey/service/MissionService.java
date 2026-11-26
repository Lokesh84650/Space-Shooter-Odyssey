
package com.spaceshooterodyssey.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.spaceshooterodyssey.entity.Mission;
import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.entity.PlayerMission;
import com.spaceshooterodyssey.model.GameSession;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.repository.MissionRepository;
import com.spaceshooterodyssey.repository.PlayerMissionRepository;
import com.spaceshooterodyssey.repository.PlayerRepository;
import com.spaceshooterodyssey.repository.GameSessionRepository;
import com.spaceshooterodyssey.repository.PlayerProfileRepository;

@Service
public class MissionService {

    private final MissionRepository missionRepository;
    private final PlayerMissionRepository playerMissionRepository;
    private final PlayerRepository playerRepository;
    private final GameSessionRepository gameSessionRepository;
    private final PlayerProfileRepository playerProfileRepository;

    public MissionService(
            MissionRepository missionRepository,
            PlayerMissionRepository playerMissionRepository,
            PlayerRepository playerRepository,
            GameSessionRepository gameSessionRepository,
            PlayerProfileRepository playerProfileRepository) {

        this.missionRepository = missionRepository;
        this.playerMissionRepository = playerMissionRepository;
        this.playerRepository = playerRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.playerProfileRepository = playerProfileRepository;
    }

    @Transactional
    public void synchronizeCompletedSessions(String email) {

        Player player = getPlayer(email);

        PlayerProfile profile = playerProfileRepository
                .findByPlayer_Email(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Player profile not found"
                ));

        List<GameSession> sessions =
                gameSessionRepository
                        .findAllByPlayerProfile_IdAndStatusOrderByStartTimeDesc(
                                profile.getId(),
                                "COMPLETED"
                        );

        for (GameSession session : sessions) {

            Mission mission = missionRepository
                    .findByMissionCodeAndActiveTrue(session.getMissionId())
                    .orElse(null);

            if (mission == null) {
                continue;
            }

            PlayerMission progress = playerMissionRepository
                    .findByPlayer_IdAndMission_MissionCode(
                            player.getId(),
                            mission.getMissionCode()
                    )
                    .orElseGet(() -> {
                        PlayerMission newProgress = new PlayerMission();
                        newProgress.setPlayer(player);
                        newProgress.setMission(mission);
                        return newProgress;
                    });

            int sessionScore = (int) Math.min(
                    Integer.MAX_VALUE,
                    Math.max(0L, session.getScore())
            );

            progress.setCompleted(true);
            progress.setScore(sessionScore);

            if (sessionScore > progress.getBestScore()) {
                progress.setBestScore(sessionScore);
            }

            if (session.getStarsAwarded() > progress.getStars()) {
                progress.setStars(session.getStarsAwarded());
            }

            if (session.getEndTime() != null) {
                progress.setCompletedAt(session.getEndTime());
            }

            progress.setRewardCredits(session.getCreditsEarned());

            playerMissionRepository.save(progress);
        }
    }

    @Transactional
    public List<MissionStatus> getPlayerMissions(String email) {

        synchronizeCompletedSessions(email);

        Player player = getPlayer(email);

        List<Mission> missions =
                missionRepository.findByActiveTrueOrderBySequenceNumberAsc();

        List<PlayerMission> progress =
                playerMissionRepository.findByPlayer_Id(player.getId());

        List<MissionStatus> result = new ArrayList<>();

        for (Mission mission : missions) {

            PlayerMission savedProgress = progress.stream()
                    .filter(p -> p.getMission().getId().equals(mission.getId()))
                    .findFirst()
                    .orElse(null);

            boolean completed =
                    savedProgress != null && savedProgress.isCompleted();

            boolean unlocked;

            if (mission.getSequenceNumber() == 1) {
                unlocked = true;
            } else {
                unlocked = missions.stream()
                        .filter(previous ->
                                previous.getSequenceNumber()
                                        == mission.getSequenceNumber() - 1)
                        .findFirst()
                        .map(previous ->
                                playerMissionRepository
                                        .existsByPlayer_IdAndMission_MissionCodeAndCompletedTrue(
                                                player.getId(),
                                                previous.getMissionCode()
                                        ))
                        .orElse(false);
            }

            result.add(new MissionStatus(
                    mission.getMissionCode(),
                    mission.getMissionName(),
                    mission.getDescription(),
                    mission.getDifficulty(),
                    mission.getSectorNumber(),
                    mission.getSectorName(),
                    mission.getSequenceNumber(),
                    mission.getMissionNumber(),
                    mission.getObjectiveType(),
                    mission.getObjectiveDescription(),
                    mission.getObjectiveTarget(),
                    mission.getBossId(),
                    mission.getRewardCredits(),
                    mission.getRewardXp(),
                    completed,
                    unlocked,
                    savedProgress == null ? 0 : savedProgress.getBestScore(),
                    savedProgress == null ? 0 : savedProgress.getStars()
            ));
        }

        return result;
    }

    @Transactional(readOnly = true)
    public Mission getUnlockedMission(String email, String missionCode) {

        Player player = getPlayer(email);

        Mission mission = missionRepository
                .findByMissionCodeAndActiveTrue(missionCode)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Mission not found"
                ));

        if (mission.getSequenceNumber() == 1) {
            return mission;
        }

        Mission previousMission = missionRepository
                .findByActiveTrueOrderBySequenceNumberAsc()
                .stream()
                .filter(m -> m.getSequenceNumber()
                        == mission.getSequenceNumber() - 1)
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Previous mission is not configured"
                ));

        boolean previousCompleted =
                playerMissionRepository
                        .existsByPlayer_IdAndMission_MissionCodeAndCompletedTrue(
                                player.getId(),
                                previousMission.getMissionCode()
                        );

        if (!previousCompleted) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Complete the previous mission first"
            );
        }

        return mission;
    }

    @Transactional
    public PlayerMission recordMissionCompletion(
            String email,
            String missionCode,
            int score,
            int stars) {

        if (score < 0 || stars < 0 || stars > 3) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid score or star value"
            );
        }

        Player player = getPlayer(email);
        Mission mission = getUnlockedMission(email, missionCode);

        PlayerMission progress = playerMissionRepository
                .findByPlayer_IdAndMission_MissionCode(
                        player.getId(),
                        missionCode
                )
                .orElseGet(() -> {
                    PlayerMission newProgress = new PlayerMission();
                    newProgress.setPlayer(player);
                    newProgress.setMission(mission);
                    return newProgress;
                });

        if (!progress.isCompleted()) {
            progress.setCompleted(true);
            progress.setCompletedAt(java.time.LocalDateTime.now());
            progress.setRewardCredits(mission.getRewardCredits());
        }

        progress.setScore(score);

        if (score > progress.getBestScore()) {
            progress.setBestScore(score);
        }

        if (stars > progress.getStars()) {
            progress.setStars(stars);
        }

        return playerMissionRepository.save(progress);
    }

    private Player getPlayer(String email) {

        Player player = playerRepository.findByEmail(email);

        if (player == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authenticated player not found"
            );
        }

        return player;
    }

    public static class MissionStatus {

        private final String missionCode;
        private final String missionName;
        private final String description;
        private final String difficulty;
        private final int sectorNumber;
        private final String sectorName;
        private final int sequenceNumber;
        private final int missionNumber;
        private final String objectiveType;
        private final String objectiveDescription;
        private final int objectiveTarget;
        private final String bossId;
        private final int rewardCredits;
        private final int rewardXp;
        private final boolean completed;
        private final boolean unlocked;
        private final int bestScore;
        private final int stars;

        public MissionStatus(
                String missionCode,
                String missionName,
                String description,
                String difficulty,
                int sectorNumber,
                String sectorName,
                int sequenceNumber,
                int missionNumber,
                String objectiveType,
                String objectiveDescription,
                int objectiveTarget,
                String bossId,
                int rewardCredits,
                int rewardXp,
                boolean completed,
                boolean unlocked,
                int bestScore,
                int stars) {

            this.missionCode = missionCode;
            this.missionName = missionName;
            this.description = description;
            this.difficulty = difficulty;
            this.sectorNumber = sectorNumber;
            this.sectorName = sectorName;
            this.sequenceNumber = sequenceNumber;
            this.missionNumber = missionNumber;
            this.objectiveType = objectiveType;
            this.objectiveDescription = objectiveDescription;
            this.objectiveTarget = objectiveTarget;
            this.bossId = bossId;
            this.rewardCredits = rewardCredits;
            this.rewardXp = rewardXp;
            this.completed = completed;
            this.unlocked = unlocked;
            this.bestScore = bestScore;
            this.stars = stars;
        }

        public String getMissionCode() { return missionCode; }
        public String getMissionName() { return missionName; }
        public String getDescription() { return description; }
        public String getDifficulty() { return difficulty; }
        public int getSectorNumber() { return sectorNumber; }
        public String getSectorName() { return sectorName; }
        public int getSequenceNumber() { return sequenceNumber; }
        public int getMissionNumber() { return missionNumber; }
        public String getObjectiveType() { return objectiveType; }
        public String getObjectiveDescription() { return objectiveDescription; }
        public int getObjectiveTarget() { return objectiveTarget; }
        public String getBossId() { return bossId; }
        public int getRewardCredits() { return rewardCredits; }
        public int getRewardXp() { return rewardXp; }
        public boolean isCompleted() { return completed; }
        public boolean isUnlocked() { return unlocked; }
        public int getBestScore() { return bestScore; }
        public int getStars() { return stars; }
    }
}
