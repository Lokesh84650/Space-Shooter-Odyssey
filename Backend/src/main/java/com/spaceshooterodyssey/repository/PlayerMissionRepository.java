
package com.spaceshooterodyssey.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshooterodyssey.entity.PlayerMission;

public interface PlayerMissionRepository
        extends JpaRepository<PlayerMission, Long> {

    List<PlayerMission> findByPlayer_Id(Long playerId);

    Optional<PlayerMission> findByPlayer_IdAndMission_MissionCode(
        Long playerId,
        String missionCode
    );

    boolean existsByPlayer_IdAndMission_Id(
        Long playerId,
        Long missionId
    );

    boolean existsByPlayer_IdAndMission_MissionCodeAndCompletedTrue(
        Long playerId,
        String missionCode
    );
}
