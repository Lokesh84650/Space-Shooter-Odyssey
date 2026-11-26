
package com.spaceshooterodyssey.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshooterodyssey.model.GameSession;

public interface GameSessionRepository
        extends JpaRepository<GameSession, Long> {

    Optional<GameSession> findBySessionId(String sessionId);

    boolean existsBySessionIdAndPlayerProfile_Id(
            String sessionId,
            Long playerProfileId
    );

    List<GameSession> findAllByPlayerProfile_IdOrderByStartTimeDesc(
            Long playerProfileId
    );

    // Retrieve completed sessions for a specific player.
    List<GameSession> findAllByPlayerProfile_IdAndStatusOrderByStartTimeDesc(
            Long playerProfileId,
            String status
    );
}
