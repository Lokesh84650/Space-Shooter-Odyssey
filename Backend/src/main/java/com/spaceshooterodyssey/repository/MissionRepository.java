
package com.spaceshooterodyssey.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.spaceshooterodyssey.entity.Mission;

public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findByActiveTrueOrderBySequenceNumberAsc();

    Optional<Mission> findByMissionCode(String missionCode);

    Optional<Mission> findByMissionCodeAndActiveTrue(String missionCode);

    boolean existsByMissionCode(String missionCode);
}
