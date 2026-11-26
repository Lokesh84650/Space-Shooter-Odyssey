import React, { useState, useEffect } from "react";
import { MISSION_CONFIG, SECTORS } from "../game/missionConfig.js";

import {
  getMissionProgress,
  isMissionUnlocked
} from "../game/missionProgress.js";
import PhaserGame from "../game/PhaserGame";
import "./Dashboard.css";
import { getPlayerProfile } from "../services/playerProfileService";
import { startGameSession } from "../services/gameSessionService";
import ShipsHangar from "../components/ShipsHangar";
import {
    getShips,
    purchaseShip,
    selectShip,
    upgradeShip
} from "../services/shipService";

// Ship information
const ships = [
    {
        name: "Interceptor",
        description: "Fast and balanced",
        unlocked: true,
        unlockRequirement: "Available by default",
        maxHealth: 100,
        movementSpeed: 6,
        weaponDamage: 1,
        defense: "Moderate"
    },
    {
        name: "Striker",
        description: "High attack power",
        unlocked: false,
        unlockRequirement: "Campaign progression required",
        maxHealth: 80,
        movementSpeed: 5,
        weaponDamage: 2,
        defense: "Weaker"
    },
    {
        name: "Guardian",
        description: "High health and defense",
        unlocked: false,
        unlockRequirement: "Campaign progression required",
        maxHealth: 150,
        movementSpeed: 3.5,
        weaponDamage: 1,
        defense: "Strong"
    },
    {
        name: "Support Craft",
        description: "Utility and support",
        unlocked: false,
        unlockRequirement: "Campaign progression required",
        maxHealth: 110,
        movementSpeed: 4.5,
        weaponDamage: 1,
        defense: "Utility-focused"
    },
    {
        name: "Experimental Ship",
        description: "Advanced capabilities",
        unlocked: false,
        unlockRequirement: "Difficult missions or progression milestones",
        maxHealth: 120,
        movementSpeed: 5.5,
        weaponDamage: 2,
        defense: "Advanced"
    }
];
function Dashboard({ onLogout }) {
    const [activeSection, setActiveSection] = useState("home");

    const [missionProgress, setMissionProgress] = useState(
        () => getMissionProgress()
    );

    const [selectedMission, setSelectedMission] = useState(
        MISSION_CONFIG[0]
    );

    const [shipList, setShipList] = useState([]);
    const [shipLoading, setShipLoading] = useState(true);
    const [shipError, setShipError] = useState("");

    const [selectedShip, setSelectedShip] = useState("Interceptor");
    const [showMissionDetails, setShowMissionDetails] = useState(false);
    const [showShipDetails, setShowShipDetails] = useState(false);
    const [gameStarted, setGameStarted] = useState(false);
    const [activeStatPanel, setActiveStatPanel] = useState(null);

    const [playerProfile, setPlayerProfile] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [sessionStarting, setSessionStarting] = useState(false);
    const [sessionError, setSessionError] = useState("");

    // Select a mission
    const handleMissionSelect = (mission) => {
        if (!isMissionUnlocked(mission.id, missionProgress)) {
            return;
        }

        setSelectedMission(mission);
        setShowMissionDetails(true);

        setTimeout(() => {
            document.getElementById("mission-details")?.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        }, 100);
    };


const getSelectedShipName = (list) => {
    const selected = list.find(ship =>
        ship.selected === true ||
        ship.isSelected === true ||
        ship.equipped === true ||
        ship.isEquipped === true
    );

    return selected?.shipName ||
           selected?.name ||
           selected?.ship?.shipName ||
           null;
};


    // Load player profile
    useEffect(() => {
        getPlayerProfile()
            .then((data) => {
                setPlayerProfile(data);
            })
            .catch((error) => {
                console.error("Player profile error:", error);
            });
    }, []);

    
// Load ships from backend and restore selected ship
useEffect(() => {
    const loadShips = async () => {
        try {
            setShipLoading(true);
            setShipError("");

            const data = await getShips();
            const list = Array.isArray(data) ? data : data?.ships || [];

            setShipList(list);

            const selectedName = getSelectedShipName(list);

            if (selectedName) {
                setSelectedShip(selectedName);
            }

        } catch (error) {
            console.error("Ship loading error:", error);
            setShipError(error.message);
        } finally {
            setShipLoading(false);
        }
    };

    loadShips();
}, []);

    // Refresh ship list and player credits
const refreshShipData = async () => {
    try {
        const [ships, profile] = await Promise.all([
            getShips(),
            getPlayerProfile()
        ]);

        setShipList(ships);
        setPlayerProfile(profile);
    } catch (error) {
        setShipError(error.message);
    }
};
const selectedName = getSelectedShipName(ships);

if (selectedName) {
    setSelectedShip(selectedName);
}

// Purchase a ship
const handleShipPurchase = async (shipId) => {
    try {
        setShipError("");

        await purchaseShip(shipId);

        await refreshShipData();

        alert("Ship purchased successfully!");
    } catch (error) {
        setShipError(error.message);
        alert(error.message);
    }
};

// Equip an owned ship
const handleShipSelect = async (shipId) => {
    try {
        setShipError("");

        const result = await selectShip(shipId);

        await refreshShipData();

        if (result.shipName) {
            setSelectedShip(result.shipName);
        }

        alert("Ship equipped successfully!");
    } catch (error) {
        setShipError(error.message);
        alert(error.message);
    }
};

// Upgrade an owned ship
const handleShipUpgrade = async (shipId, upgradeType) => {
    try {
        setShipError("");

        await upgradeShip(shipId, upgradeType);

        await refreshShipData();

        alert("Ship upgraded successfully!");
    } catch (error) {
        setShipError(error.message);
        alert(error.message);
    }
};


const handleStartMission = async (
    missionToStart = selectedMission,
    isReplay = false
) => {
    if (sessionStarting) return;

    if (!missionToStart?.id) {
        setSessionError("Please select a mission first.");
        return;
    }

    try {
        setSessionError("");
        setSessionStarting(true);

        const response = await startGameSession(
            missionToStart.id,
            selectedShip
        );

        if (!response?.sessionId) {
            throw new Error("Could not start the game session.");
        }

        setSelectedMission(missionToStart);
        setSessionId(response.sessionId);
        setShowMissionDetails(false);
        setGameStarted(true);

        // Move the screen to the actual game area
        setTimeout(() => {
            document.getElementById("play-game")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }, 200);

    } catch (error) {
        console.error("Mission start error:", error);
        setSessionError(error.message || "Unable to start mission.");
    } finally {
        setSessionStarting(false);
    }
};




    return (
        <div className="game-dashboard">

            {/* Sidebar */}
            <aside className="sidebar">

                <div className="brand">
                    <span className="brand-icon">🚀</span>
                    <h2>SPACE<br />ODYSSEY</h2>
                </div>

                <p className="menu-label">MAIN MENU</p>

                <nav className="sidebar-menu">

                    <a
                        className={activeSection === "home" ? "active" : ""}
                        href="#home"
                        onClick={() => setActiveSection("home")}
                    >
                        ⌂ Dashboard
                    </a>

                    <a
                        className={activeSection === "missions" ? "active" : ""}
                        href="#missions"
                        onClick={() => setActiveSection("missions")}
                    >
                        ⚔ Missions
                    </a>

                    <a
                        className={activeSection === "spaceships" ? "active" : ""}
                        href="#spaceships"
                        onClick={() => setActiveSection("spaceships")}
                    >
                        🚀 Spaceships
                    </a>

                    <a
                        className={activeSection === "profile" ? "active" : ""}
                        href="#profile"
                        onClick={() => setActiveSection("profile")}
                    >
                        👤 My Profile
                    </a>

                    <a
                        className={activeSection === "leaderboard" ? "active" : ""}
                        href="#leaderboard"
                        onClick={() => setActiveSection("leaderboard")}
                    >
                        🏆 Leaderboard
                    </a>

                </nav>

                <div className="sidebar-bottom">

                    <div className="online-status">
                        <span></span> SYSTEM ONLINE
                    </div>

                    <p>SPACE ODYSSEY v1.0</p>

                </div>

            </aside>

            {/* Main Content */}
            <main className="main-content">

                {/* Topbar */}
                <header className="topbar">

                    <div>
                        <p className="top-label">COMMAND CENTER</p>
                        <h2>Welcome Back, Pilot!</h2>
                    </div>

                    <div className="player-mini-profile">

    <div className="avatar">👨‍🚀</div>

    <div>
        <h4>{localStorage.getItem("username") || "Space Player"}</h4>
        <p>Level 01 • Rookie</p>
    </div>

    <button
        onClick={onLogout}
        style={{
            marginLeft: "20px",
            padding: "10px 16px",
            background: "#25152F",
            color: "#FF6B81",
            border: "1px solid #FF6B81",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold"
        }}
    >
        LOGOUT
    </button>

</div>

                </header>

                {/* Hero Section */}
                <section className="hero" id="home">

                    <div className="hero-content">

                        <span className="hero-tag">
                            ✦ GALACTIC ADVENTURE AWAITS
                        </span>

                        <h1>
                            EXPLORE THE<br />
                            <span>UNKNOWN GALAXY</span>
                        </h1>

                        <p>
                            Pilot your spaceship, defeat enemies,
                            complete missions and become the
                            greatest space warrior.
                        </p>

                        <button
                            className="primary-btn"
                            onClick={() =>
                                document.getElementById("missions").scrollIntoView({
                                    behavior: "smooth"
                                })
                            }
                        >
                            ▶ START YOUR JOURNEY
                        </button>

                    </div>

                    <div className="hero-visual">

                        <div className="planet planet-one"></div>
                        <div className="planet planet-two"></div>
                        <div className="orbit orbit-one"></div>
                        <div className="orbit orbit-two"></div>
                        <div className="hero-ship">🚀</div>
                        <div className="hero-glow"></div>

                    </div>

                </section>

                {/* Phaser Game Section */}
                <section className="game-area" id="play-game">

                    <div className="section-heading">

                        <div>
                            <p className="top-label">READY FOR BATTLE?</p>
                            <h2>Space Battle Arena</h2>
                        </div>

                    </div>

                  {sessionError && (
    <p style={{ color: "#FF5C75" }}>{sessionError}</p>
)}

{sessionStarting && (
    <p style={{ color: "#20D9FF" }}>
        Preparing your mission...
    </p>
)}

{gameStarted && (
    <PhaserGame
        selectedShip={selectedShip}
        selectedMission={selectedMission}
        sessionId={sessionId}
    />
)}
                </section>

               
{/* Player Statistics */}
<section className="stats-grid" id="profile">

    <div
        className="game-stat"
        onClick={() => setActiveStatPanel("level")}
        role="button"
        tabIndex={0}
    >
        <div className="stat-icon blue">⚡</div>
        <div>
            <p>PLAYER LEVEL</p>
            <h2>{playerProfile ? String(playerProfile.level).padStart(2, "0") : "--"}</h2>
<span>{playerProfile ? playerProfile.playerName : "Loading..."}</span>
        </div>
    </div>

    <div
        className="game-stat"
        onClick={() => setActiveStatPanel("score")}
        role="button"
        tabIndex={0}
    >
        <div className="stat-icon purple">🎯</div>
        <div>
            <p>TOTAL SCORE</p>
            <h2>{playerProfile ? playerProfile.totalScore.toLocaleString() : "--"}</h2>
<span>Battle points</span>
        </div>
    </div>

    <div
        className="game-stat"
        onClick={() => setActiveStatPanel("credits")}
        role="button"
        tabIndex={0}
    >
        <div className="stat-icon gold">🪙</div>
        <div>
            <p>AVAILABLE CREDITS</p>
           <h2>{playerProfile ? playerProfile.credits.toLocaleString() : "--"}</h2>
<span>Ready to spend</span>
        </div>
    </div>

    <div
        className="game-stat"
        onClick={() => setActiveStatPanel("health")}
        role="button"
        tabIndex={0}
    >
        <div className="stat-icon green">🛡️</div>
        <div>
            <p>SHIP HEALTH</p>
          <h2>{playerProfile ? `${playerProfile.shipHealth}%` : "--"}</h2>
<span>{playerProfile && playerProfile.shipHealth > 0 ? "Fully operational" : "Loading..."}</span>
        </div>
    </div>

</section>


{/* Player Statistics Details */}
{activeStatPanel && (
    <div className="stats-detail-panel">

        <button
            className="close-stat-panel"
            onClick={() => setActiveStatPanel(null)}
        >
            ✕
        </button>

        {activeStatPanel === "level" && (
            <>
                <h2>⚡ Player Level</h2>
                <p>Current Level: 01</p>
                <p>Rank: Rookie Pilot</p>
                <p>XP Progress: Not yet connected</p>
            </>
        )}

        {activeStatPanel === "score" && (
            <>
                <h2>🎯 Score Details</h2>
                <p>Total Score: 0</p>
                <p>Best Score: Not yet recorded</p>
                <p>Complete missions to earn battle points.</p>
            </>
        )}

        {activeStatPanel === "credits" && (
            <>
                <h2>🪙 Player Wallet</h2>
                <p>Available Credits: 100</p>
                <p>Use credits for spaceship upgrades and power-ups.</p>
                <p>Transaction history: Not yet connected</p>
            </>
        )}

        {activeStatPanel === "health" && (
            <>
                <h2>🛡️ Spaceship Health</h2>
                <p>Current Health: 100%</p>
                <p>Status: Fully operational</p>
                <p>Ship upgrades: Not yet connected</p>
            </>
        )}

    </div>
)}



                {/* Missions */}
                <section className="missions-area" id="missions">

                    <div className="section-heading">

                        <div>
                            <p className="top-label">YOUR NEXT CHALLENGE</p>
                            <h2>Mission Control</h2>
                        </div>

                        <span className="mission-count">
                            01 AVAILABLE
                        </span>

                    </div>

                    <div className="mission-grid">

                        <article className="mission-card">

                            <div className="mission-art">
                                <span>🌌</span>
                                <label>BEGINNER</label>
                            </div>

                            <div className="mission-info">

                                <div className="mission-title">
                                    <h3>First Flight</h3>
                                    <span className="easy">EASY</span>
                                </div>

                                <p>
                                    Enter the galaxy and complete your
                                    first space adventure.
                                </p>

                                <div className="mission-details" id="mission-details">
                                    <span>🎯 Target: 500</span>
                                    <span>🪙 Reward: 100</span>
                                </div>

                               
<button
    className="mission-btn"
    onClick={() => handleStartMission(selectedMission)}
    disabled={sessionStarting || gameStarted || !selectedMission?.id}
>
    ▶ START MISSION
</button>




                                {showMissionDetails && (

                                    <div className="mission-extra-details">

                                        <h4>Mission Briefing</h4>

                                        <p>
                                            Destroy enemy spaceships and
                                            achieve a score of 500.
                                        </p>

                                        <p>Difficulty: Easy</p>
                                        <p>Reward: 100 Credits</p>

                                    </div>

                                )}

                            </div>

                        </article>

                        <article className="locked-card">

                            <div className="lock-icon">🔒</div>

                            <h3>More Missions Coming</h3>

                            <p>
                                Complete your first flight to unlock
                                new challenges.
                            </p>

                        </article>

                    </div>

                </section>
{/* Premium Spaceship Hangar */}
<ShipsHangar
    selectedShip={selectedShip}
    setSelectedShip={setSelectedShip}
    showShipDetails={showShipDetails}
    setShowShipDetails={setShowShipDetails}
    ships={shipList}
    credits={playerProfile?.credits ?? 0}
    loading={shipLoading}
    error={shipError}
    onPurchase={handleShipPurchase}
    onSelect={handleShipSelect}
    onUpgrade={handleShipUpgrade}
/>


                <div className="all-missions">
  {SECTORS.map((sector) => (
    <div className="sector-block" key={sector.id}>
      <h3>{sector.name}</h3>

      <div className="mission-grid">
        {sector.missions.map((mission) => {
          const unlocked = isMissionUnlocked(
            mission.id,
            missionProgress
          );

          const completed =
            missionProgress.completedMissions.includes(mission.id);

          return (
            <div className="mission-card" key={mission.id}>
              <h4>{mission.name}</h4>

              <p>Difficulty: {mission.difficulty}</p>

              <p>
                Status:{" "}
                {completed
                  ? "Completed"
                  : unlocked
                  ? "Available"
                  : "Locked"}
              </p>

              
<button
    className="mission-btn"
    disabled={!unlocked || sessionStarting}
    onClick={() => {
        if (completed) {
            handleStartMission(mission, true);
        } else {
            handleMissionSelect(mission);
        }
    }}
>
    {completed
        ? "REPLAY MISSION"
        : unlocked
        ? "SELECT MISSION"
        : "LOCKED"}
</button>

            </div>
          );
        })}
      </div>
    </div>
  ))}
</div>

                {/* Footer */}
                <footer className="game-footer">
                    SPACE SHOOTER ODYSSEY © 2026 • EXPLORE. FIGHT. CONQUER.
                </footer>

            </main>

        </div>
    );
}

export default Dashboard;