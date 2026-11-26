
package com.spaceshooterodyssey.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.spaceshooterodyssey.dto.WalletResponse;
import com.spaceshooterodyssey.entity.WalletTransaction;
import com.spaceshooterodyssey.service.WalletService;
import com.spaceshooterodyssey.service.DailyRewardService;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletService walletService;
    private final DailyRewardService dailyRewardService;

    public WalletController(
            WalletService walletService,
            DailyRewardService dailyRewardService) {

        this.walletService = walletService;
        this.dailyRewardService = dailyRewardService;
    }

    @GetMapping
    public WalletResponse getWallet(
            @AuthenticationPrincipal String email) {

        return walletService.getWallet(email);
    }

    @GetMapping("/history")
    public List<WalletTransaction> getHistory(
            @AuthenticationPrincipal String email) {

        return walletService.getHistory(email);
    }

    @GetMapping("/daily-reward/status")
    public Map<String, Object> getDailyRewardStatus(
            @AuthenticationPrincipal String email) {

        return dailyRewardService.getDailyRewardStatus(email);
    }

    @PostMapping("/daily-reward")
    public Map<String, Object> claimDailyReward(
            @AuthenticationPrincipal String email) {

        return dailyRewardService.claimDailyReward(email);
    }
}
