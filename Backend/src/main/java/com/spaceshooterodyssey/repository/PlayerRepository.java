package com.spaceshooterodyssey.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.spaceshooterodyssey.entity.Player;

public interface PlayerRepository extends JpaRepository<Player, Long> {

    boolean existsByEmail(String email);

    Player findByEmail(String email);
}
