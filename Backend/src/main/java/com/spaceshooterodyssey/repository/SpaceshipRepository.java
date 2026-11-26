
package com.spaceshooterodyssey.repository;

import com.spaceshooterodyssey.entity.Spaceship;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface SpaceshipRepository extends JpaRepository<Spaceship, Long> {

    List<Spaceship> findByActiveTrue();

    Optional<Spaceship> findByShipCode(String shipCode);

    Optional<Spaceship> findByShipCodeAndActiveTrue(String shipCode);

    boolean existsByShipCode(String shipCode);
}
