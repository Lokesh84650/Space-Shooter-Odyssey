
package com.spaceshooterodyssey.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshooterodyssey.model.PlayerProfile;

public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, Long> {

    Optional<PlayerProfile> findByPlayer_Email(String email);

}
