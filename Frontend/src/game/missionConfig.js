
const SECTOR_NAMES = [
    "Orion Frontier",
    "Nebula Expanse",
    "Solar Dominion",
    "Rift Territories",
    "Void Empire"
];

const BOSS_IDS = [
    "ironWarden",
    "nebulaSerpent",
    "solarDevourer",
    "riftCarrier",
    "voidEmperor"
];

const ENEMY_TYPES = [
    "scoutFighter",
    "interceptor",
    "armoredCruiser",
    "longRangeGunship",
    "eliteEnemy"
];

const OBJECTIVES = [
    {
        type: "destroy_enemies",
        description: "Destroy the required enemy forces"
    },
    {
        type: "survive_duration",
        description: "Survive the enemy attack"
    },
    {
        type: "destroy_enemy_type",
        description: "Destroy the designated enemy type"
    },
    {
        type: "collect_items",
        description: "Collect the required mission items"
    },
    {
        type: "defeat_boss",
        description: "Defeat the sector boss"
    },
    {
        type: "limited_damage",
        description: "Complete the encounter with limited damage"
    },
    {
        type: "time_limit",
        description: "Complete the mission within the time target"
    },
    {
        type: "protect_target",
        description: "Protect the designated target"
    },
    {
        type: "destroy_enemies",
        description: "Clear the remaining enemy forces"
    },
    {
        type: "defeat_boss",
        description: "Defeat the sector boss"
    }
];

const DIFFICULTIES = [
    "easy",
    "easy",
    "normal",
    "normal",
    "normal",
    "hard",
    "hard",
    "hard",
    "expert",
    "boss"
];

export const MISSION_CONFIG = SECTOR_NAMES.flatMap(
    (sectorName, sectorIndex) => {

        return Array.from({ length: 10 }, (_, missionIndex) => {

            const missionNumber = missionIndex + 1;
            const globalMissionNumber =
                sectorIndex * 10 + missionNumber;

            const isBossMission = missionNumber === 10;

            return {
                id: `sector-${sectorIndex + 1}-mission-${String(missionNumber).padStart(2, "0")}`,

                sectorId: `sector-${sectorIndex + 1}`,
                sectorName,

                sequence: globalMissionNumber,
                missionNumber,

                name: `Mission ${globalMissionNumber}`,

                difficulty: DIFFICULTIES[missionIndex],

                objective: {
                    ...OBJECTIVES[missionIndex],
                    requiredCount:
                        missionIndex === 0 ? 5 + sectorIndex * 2 :
                        missionIndex === 1 ? 30 + sectorIndex * 10 :
                        missionIndex === 2 ? 3 + sectorIndex :
                        missionIndex === 3 ? 3 + sectorIndex :
                        missionIndex === 4 ? 1 :
                        missionIndex === 5 ? 1 :
                        missionIndex === 6 ? 120 + sectorIndex * 30 :
                        missionIndex === 7 ? 60 + sectorIndex * 15 :
                        10 + sectorIndex * 2
                },

                waves: [
                    {
                        id: 1,
                        enemies: [
                            {
                                type: ENEMY_TYPES[0],
                                count: 5 + sectorIndex * 2
                            },
                            {
                                type: ENEMY_TYPES[1],
                                count: 2 + sectorIndex
                            }
                        ]
                    },
                    {
                        id: 2,
                        enemies: [
                            {
                                type: ENEMY_TYPES[2],
                                count: 1 + sectorIndex
                            },
                            {
                                type: ENEMY_TYPES[3],
                                count: 2 + sectorIndex
                            }
                        ]
                    }
                ],

                bossId: isBossMission
                    ? BOSS_IDS[sectorIndex]
                    : null,

                rewards: {
                    credits: 100 + globalMissionNumber * 10,
                    xp: 50 + globalMissionNumber * 5
                },
unlockRequirements:
    globalMissionNumber === 1
        ? []
        : [
            {
                type: "complete_previous_mission",
                missionId: `sector-${Math.ceil((globalMissionNumber - 1) / 10)}-mission-${String(((globalMissionNumber - 2) % 10) + 1).padStart(2, "0")}`
            }
        ]
            };
        });
    }
);

export const SECTORS = SECTOR_NAMES.map(
    (name, index) => ({
        id: `sector-${index + 1}`,
        name,
        firstMission: index * 10 + 1,
        lastMission: index * 10 + 10,
        missions: MISSION_CONFIG.filter(
            mission => mission.sectorId === `sector-${index + 1}`
        )
    })
);
