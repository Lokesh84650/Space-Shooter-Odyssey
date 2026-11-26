
package com.spaceshooterodyssey.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.spaceshooterodyssey.entity.Mission;
import com.spaceshooterodyssey.entity.PlayerMission;
import com.spaceshooterodyssey.service.MissionService;
import com.spaceshooterodyssey.service.MissionService.MissionStatus;

@RestController
@RequestMapping("/api/missions")
public class MissionController {

    private final MissionService missionService;

    public MissionController(MissionService missionService) {
        this.missionService = missionService;
    }

    // Get all 50 missions and the logged-in player's progress
    @GetMapping
    public List<MissionStatus> getMissions(
            @AuthenticationPrincipal String email) {

        return missionService.getPlayerMissions(email);
    }

    // Get one mission only if the player has unlocked it
    @GetMapping("/{missionCode}")
    public Mission getMission(
            @AuthenticationPrincipal String email,
            @PathVariable String missionCode) {

        return missionService.getUnlockedMission(email, missionCode);
    }

    // Record mission completion
    // This endpoint is temporary and will be secured through game-session
    // validation before we connect it to the frontend.
    @PostMapping("/{missionCode}/complete")
    public PlayerMission completeMission(
            @AuthenticationPrincipal String email,
            @PathVariable String missionCode,
            @RequestBody CompleteMissionRequest request) {

        return missionService.recordMissionCompletion(
                email,
                missionCode,
                request.getScore(),
                request.getStars()
        );
    }

    public static class CompleteMissionRequest {

        private int score;
        private int stars;

        public int getScore() {
            return score;
        }

        public void setScore(int score) {
            this.score = score;
        }

        public int getStars() {
            return stars;
        }

        public void setStars(int stars) {
            this.stars = stars;
        }
    }
}

