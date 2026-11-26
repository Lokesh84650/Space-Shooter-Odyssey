
package com.spaceshooterodyssey.service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.spaceshooterodyssey.entity.Mission;
import com.spaceshooterodyssey.repository.MissionRepository;

@Component
public class MissionDataSeeder implements CommandLineRunner {

    private final MissionRepository missionRepository;

    public MissionDataSeeder(MissionRepository missionRepository) {
        this.missionRepository = missionRepository;
    }

    private static final String[] SECTOR_NAMES = {
        "Orion Frontier",
        "Nebula Expanse",
        "Solar Dominion",
        "Rift Territories",
        "Void Empire"
    };

    private static final String[] BOSS_IDS = {
        "ironWarden",
        "nebulaSerpent",
        "solarDevourer",
        "riftCarrier",
        "voidEmperor"
    };

    private static final String[] OBJECTIVE_TYPES = {
        "destroy_enemies",
        "survive_duration",
        "destroy_enemy_type",
        "collect_items",
        "defeat_boss",
        "limited_damage",
        "time_limit",
        "protect_target",
        "destroy_enemies",
        "defeat_boss"
    };

    private static final String[] OBJECTIVE_DESCRIPTIONS = {
        "Destroy the required enemy forces",
        "Survive the enemy attack",
        "Destroy the designated enemy type",
        "Collect the required mission items",
        "Defeat the sector boss",
        "Complete the encounter with limited damage",
        "Complete the mission within the time target",
        "Protect the designated target",
        "Clear the remaining enemy forces",
        "Defeat the sector boss"
    };

    private static final String[] DIFFICULTIES = {
        "easy", "easy", "normal", "normal", "normal",
        "hard", "hard", "hard", "expert", "boss"
    };

    @Override
    @Transactional
    public void run(String... args) {

        Set<String> existingCodes = new HashSet<>();

        missionRepository.findAll().forEach(mission -> {
            if (mission.getMissionCode() != null) {
                existingCodes.add(mission.getMissionCode());
            }
        });

        List<Mission> newMissions = new java.util.ArrayList<>();

        for (int sectorIndex = 0; sectorIndex < 5; sectorIndex++) {

            for (int missionIndex = 0; missionIndex < 10; missionIndex++) {

                int missionNumber = missionIndex + 1;
                int globalNumber = sectorIndex * 10 + missionNumber;

                String missionCode = String.format(
                    "sector-%d-mission-%02d",
                    sectorIndex + 1,
                    missionNumber
                );

                if (existingCodes.contains(missionCode)) {
                    continue;
                }

                Mission mission = new Mission();

                mission.setMissionCode(missionCode);
                mission.setMissionName("Mission " + globalNumber);

                mission.setDescription(
                    OBJECTIVE_DESCRIPTIONS[missionIndex]
                );

                mission.setDifficulty(
                    DIFFICULTIES[missionIndex]
                );

                mission.setSectorNumber(sectorIndex + 1);
                mission.setSectorName(SECTOR_NAMES[sectorIndex]);

                mission.setSequenceNumber(globalNumber);
                mission.setMissionNumber(missionNumber);

                mission.setObjectiveType(
                    OBJECTIVE_TYPES[missionIndex]
                );

                mission.setObjectiveDescription(
                    OBJECTIVE_DESCRIPTIONS[missionIndex]
                );

                int objectiveTarget;

                switch (missionIndex) {
                    case 0:
                        objectiveTarget = 5 + sectorIndex * 2;
                        break;
                    case 1:
                        objectiveTarget = 30 + sectorIndex * 10;
                        break;
                    case 2:
                        objectiveTarget = 3 + sectorIndex;
                        break;
                    case 3:
                        objectiveTarget = 3 + sectorIndex;
                        break;
                    case 4:
                        objectiveTarget = 1;
                        break;
                    case 5:
                        objectiveTarget = 1;
                        break;
                    case 6:
                        objectiveTarget = 120 + sectorIndex * 30;
                        break;
                    case 7:
                        objectiveTarget = 60 + sectorIndex * 15;
                        break;
                    default:
                        objectiveTarget = 10 + sectorIndex * 2;
                        break;
                }

                mission.setObjectiveTarget(objectiveTarget);

                if (missionNumber == 10) {
                    mission.setBossId(BOSS_IDS[sectorIndex]);
                }

                mission.setRequiredLevel(1);
                mission.setRewardCredits(100 + globalNumber * 10);
                mission.setRewardXp(50 + globalNumber * 5);
                mission.setTargetScore(500);
                mission.setActive(true);

                newMissions.add(mission);
            }
        }

        if (!newMissions.isEmpty()) {
            missionRepository.saveAll(newMissions);
        }

        System.out.println(
            "Mission seeding finished. Total campaign missions: "
            + missionRepository.count()
        );
    }
}
