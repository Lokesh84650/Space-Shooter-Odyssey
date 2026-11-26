
package com.spaceshooterodyssey.repository;

import com.spaceshooterodyssey.entity.PlayerShip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerShipRepository extends JpaRepository<PlayerShip, Long> {

    List<PlayerShip> findByPlayer_Email(String email);

    Optional<PlayerShip> findByPlayer_EmailAndSpaceship_Id(
            String email, Long spaceshipId
    );

    boolean existsByPlayer_EmailAndSpaceship_Id(
            String email, Long spaceshipId
    );
}
