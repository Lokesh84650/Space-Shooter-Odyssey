
import { MISSION_CONFIG } from "./missionConfig.js";

const STORAGE_KEY = "space-shooter-mission-progress";

const createInitialProgress = () => ({
    completedMissions: [],
    unlockedMissions: [MISSION_CONFIG[0].id],
    missionResults: {}
});

export const getMissionProgress = () => {
    try {
        if (typeof localStorage === "undefined") {
    return createInitialProgress();
}

const savedProgress = localStorage.getItem(STORAGE_KEY);

        if (!savedProgress) {
            return createInitialProgress();
        }

        const progress = JSON.parse(savedProgress);

        return {
            completedMissions: Array.isArray(progress.completedMissions)
                ? progress.completedMissions
                : [],
            unlockedMissions: Array.isArray(progress.unlockedMissions)
                ? progress.unlockedMissions
                : [MISSION_CONFIG[0].id],
            missionResults: progress.missionResults || {}
        };
    } catch (error) {
        console.error("Could not load mission progress:", error);
        return createInitialProgress();
    }
};

export const isMissionUnlocked = (missionId, progress = getMissionProgress()) => {
    return progress.unlockedMissions.includes(missionId);
};

export const completeMission = (missionId, result = {}) => {
    const mission = MISSION_CONFIG.find(item => item.id === missionId);

    if (!mission) {
        throw new Error(`Mission not found: ${missionId}`);
    }

    const progress = getMissionProgress();

    if (!progress.unlockedMissions.includes(missionId)) {
        throw new Error("This mission is locked.");
    }

    if (!progress.completedMissions.includes(missionId)) {
        progress.completedMissions.push(missionId);
    }

    progress.missionResults[missionId] = {
        score: Math.max(0, Number(result.score) || 0),
        stars: Math.max(0, Math.min(3, Number(result.stars) || 0)),
        completedAt: new Date().toISOString()
    };

    const nextMission = MISSION_CONFIG.find(
        item => item.sequence === mission.sequence + 1
    );

    if (nextMission) {
        if (!progress.unlockedMissions.includes(nextMission.id)) {
            progress.unlockedMissions.push(nextMission.id);
        }
    }

   if (typeof localStorage !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

    return progress;
};
