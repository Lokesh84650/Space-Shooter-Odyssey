
package com.spaceshooterodyssey.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

@RestController
public class GameController {

    @GetMapping("/api/test")
    public String testApi() {
        return "Space Shooter Odyssey Backend is Working!";
    }

    @GetMapping("/api/secure-test")
    public String secureTest(@AuthenticationPrincipal String email) {
        return "Welcome " + email + "! JWT authentication is working.";
    }
}

