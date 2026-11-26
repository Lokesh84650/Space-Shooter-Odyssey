
package com.spaceshooterodyssey.service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.spaceshooterodyssey.entity.Player;
import com.spaceshooterodyssey.model.PlayerProfile;
import com.spaceshooterodyssey.repository.PlayerProfileRepository;
import com.spaceshooterodyssey.repository.PlayerRepository;

@Service
public class DailyRewardService {

    private static final ZoneId INDIA_ZONE =
            ZoneId.of("Asia/Kolkata");

    private static final int[] DAILY_REWARDS = {
        50, 75, 100, 125, 150, 200, 300
    };

    private final PlayerRepository playerRepository;
    private final PlayerProfileRepository playerProfileRepository;
    private final WalletService walletService;

    public DailyRewardService(
            PlayerRepository playerRepository,
            PlayerProfileRepository playerProfileRepository,
            WalletService walletService) {

        this.playerRepository = playerRepository;
        this.playerProfileRepository = playerProfileRepository;
        this.walletService = walletService;
    }

    // Get reward status without claiming anything.
    @Transactional
    public Map<String, Object> getDailyRewardStatus(String email) {

        Player player = playerRepository.findByEmailForUpdate(email);

        if (player == null) {
            throw new IllegalArgumentException("Player not found.");
        }

        LocalDate today = LocalDate.now(INDIA_ZONE);
        LocalDate lastClaim = player.getLastDailyRewardDate();

        boolean claimedToday = today.equals(lastClaim);

        int currentStreak = 0;
        int rewardDay;

        if (claimedToday) {
            currentStreak = player.getConsecutiveLoginDays();
            rewardDay = ((currentStreak - 1) % 7) + 1;
        } else if (lastClaim != null &&
                   lastClaim.equals(today.minusDays(1))) {

            currentStreak = player.getConsecutiveLoginDays();
            rewardDay = ((currentStreak) % 7) + 1;

        } else {
            rewardDay = 1;
        }

        int rewardCredits = DAILY_REWARDS[rewardDay - 1];

        PlayerProfile profile = playerProfileRepository
                .findByPlayer_Email(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Player profile not found."));

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("claimedToday", claimedToday);
        response.put("streakDays", currentStreak);
        response.put("rewardDay", rewardDay);
        response.put("creditsEarned", rewardCredits);
        response.put("walletBalance", profile.getCredits());
        response.put("claimDate", lastClaim);
        response.put("rewards", DAILY_REWARDS);

        return response;
    }

    // Claim today's daily reward.
    @Transactional
    public Map<String, Object> claimDailyReward(String email) {

        Player player = playerRepository.findByEmailForUpdate(email);

        if (player == null) {
            throw new IllegalArgumentException("Player not found.");
        }

        LocalDate today = LocalDate.now(INDIA_ZONE);
        LocalDate lastClaim = player.getLastDailyRewardDate();

        if (today.equals(lastClaim)) {
            throw new IllegalArgumentException(
                    "You have already claimed today's daily reward.");
        }

        int streak;

        if (lastClaim != null &&
            lastClaim.equals(today.minusDays(1))) {

            streak = player.getConsecutiveLoginDays() + 1;

        } else {
            streak = 1;
        }

        int rewardDay = ((streak - 1) % 7) + 1;
        int rewardCredits = DAILY_REWARDS[rewardDay - 1];

        String referenceId = "DAILY_LOGIN_REWARD:" + today;

        int updatedBalance = walletService.credit(
                email,
                rewardCredits,
                "DAILY_LOGIN_REWARD",
                "DAILY_STREAK",
                referenceId
        ).getBalance();

        player.setLastDailyRewardDate(today);
        player.setConsecutiveLoginDays(streak);
        playerRepository.save(player);

        PlayerProfile profile = playerProfileRepository
                .findByPlayer_Email(email)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Player profile not found."));

        profile.setCredits(updatedBalance);
        playerProfileRepository.save(profile);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("message", "Daily reward claimed successfully!");
        response.put("claimedToday", true);
        response.put("rewardDay", rewardDay);
        response.put("streakDays", streak);
        response.put("creditsEarned", rewardCredits);
        response.put("walletBalance", updatedBalance);
        response.put("claimDate", today);

        return response;
    }
}
