
import React from "react";

import "./ShipsHangar.css";

// Design details for all five spacecraft
const SHIP_DESIGNS = {
    "NOVA-01": {
        role: "AGILITY FIGHTER",
        rarity: "STANDARD",
        color: "#20D9FF",
        description: "A precision fighter engineered for speed, rapid strikes and fast battlefield response."
    },
    "VOLT-02": {
        role: "ASSAULT FIGHTER",
        rarity: "RARE",
        color: "#FF704D",
        description: "A high-impact attack craft designed to overwhelm enemy formations."
    },
    "AEGIS-03": {
        role: "DEFENSE SPECIALIST",
        rarity: "EPIC",
        color: "#65E6A5",
        description: "An armored combat vessel built to absorb heavy damage."
    },
    "PULSE-04": {
        role: "TACTICAL SUPPORT",
        rarity: "RARE",
        color: "#B58AFF",
        description: "A versatile support vessel designed for tactical operations."
    },
    "OMEGA-05": {
        role: "ADVANCED PROTOTYPE",
        rarity: "LEGENDARY",
        color: "#FFD36A",
        description: "An experimental spacecraft featuring advanced combat technology."
    }
};

// Spacecraft artwork
function ShipArtwork({ color = "#20D9FF", locked = false, ship = {} }) {
    const code = ship.codename || ship.shipCode || "NOVA-01";

    return (
        <svg
            viewBox="0 0 300 220"
            width="100%"
            height="100%"
            role="img"
            aria-label={`${ship.name || "Spaceship"} artwork`}
            style={{
                opacity: locked ? 0.45 : 1,
                filter: `drop-shadow(0 0 12px ${color})`
            }}
        >
            <defs>
                <linearGradient id={`shipGradient-${code}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor={color} />
                    <stop offset="100%" stopColor="#17233D" />
                </linearGradient>
            </defs>

            {/* Engine flames */}
            <path
                d="M125 145 L135 205 L150 174 L165 205 L175 145"
                fill="#FF8A35"
                opacity="0.9"
            />
            <path
                d="M140 150 L150 190 L160 150"
                fill="#FFF0A6"
            />

            {/* Left and right wings */}
            {code === "AEGIS-03" ? (
                <>
                    <path d="M135 95 L28 135 L55 175 L145 150 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M165 95 L272 135 L245 175 L155 150 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M35 138 L80 145 M265 138 L220 145"
                        stroke={color} strokeWidth="5" />
                </>
            ) : code === "VOLT-02" ? (
                <>
                    <path d="M135 105 L18 175 L65 168 L145 145 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M165 105 L282 175 L235 168 L155 145 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                </>
            ) : code === "PULSE-04" ? (
                <>
                    <path d="M130 105 L35 125 L55 165 L145 150 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M170 105 L265 125 L245 165 L155 150 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <circle cx="48" cy="142" r="9" fill={color} />
                    <circle cx="252" cy="142" r="9" fill={color} />
                </>
            ) : code === "OMEGA-05" ? (
                <>
                    <path d="M140 95 L15 150 L65 155 L145 145 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M160 95 L285 150 L235 155 L155 145 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M130 110 L95 45 L145 90 Z"
                        fill={color} stroke="#FFFFFF" strokeWidth="2" />
                    <path d="M170 110 L205 45 L155 90 Z"
                        fill={color} stroke="#FFFFFF" strokeWidth="2" />
                </>
            ) : (
                <>
                    <path d="M135 105 L35 150 L70 165 L145 145 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                    <path d="M165 105 L265 150 L230 165 L155 145 Z"
                        fill={`url(#shipGradient-${code})`} stroke={color} strokeWidth="3" />
                </>
            )}

            {/* Main spacecraft body */}
            <path
                d="M150 15
                   C135 45 120 90 125 140
                   L150 165
                   L175 140
                   C180 90 165 45 150 15 Z"
                fill={`url(#shipGradient-${code})`}
                stroke={color}
                strokeWidth="3"
            />

            {/* Cockpit */}
            <path
                d="M150 52 C132 75 133 98 150 115 C167 98 168 75 150 52 Z"
                fill="#071A35"
                stroke="#B9F5FF"
                strokeWidth="3"
            />

            <path
                d="M150 62 L150 105"
                stroke={color}
                strokeWidth="3"
            />

            {/* Wing lights */}
            <circle cx="76" cy="151" r="5" fill="#FFFFFF" />
            <circle cx="224" cy="151" r="5" fill="#FFFFFF" />

            {/* Engine details */}
            <path d="M132 140 L132 165 M168 140 L168 165"
                stroke="#FFFFFF" strokeWidth="3" />

            <path d="M150 18 L150 35"
                stroke="#FFFFFF" strokeWidth="3" />
        </svg>
    );
}

// Individual ship statistic bar
function ShipStat({ label, value, percent, color }) {
    return (
        <div className="ship-stat">
            <div className="ship-stat-heading">
                <span>{label}</span>
                <strong>{value}</strong>
            </div>

            <div className="ship-stat-track">
                <div
                    className="ship-stat-fill"
                    style={{
                        width: `${Math.max(0, Math.min(percent || 0, 100))}%`,
                        background: color
                    }}
                />
            </div>
        </div>
    );
}

export default function ShipsHangar({
    selectedShip,
    setSelectedShip,
    showShipDetails,
    setShowShipDetails,
    ships: apiShips,
    credits = 0,
    onPurchase,
    onSelect,
    onUpgrade,
    loading,
    error
}) {
    const ships = (apiShips || []).map((ship) => {
        const design = SHIP_DESIGNS[ship.shipCode] || {};

        return {
            ...ship,
            name: ship.shipName,
            codename: ship.shipCode,
            role: design.role || "COMBAT SPACECRAFT",
            rarity: design.rarity || "STANDARD",
            color: design.color || "#20D9FF",
            description: design.description || ship.description || "Combat spacecraft.",
            damage: ship.attackPower,
            defense: ship.health,
            unlocked: ship.owned,
            upgradeLevel: ship.upgradeLevel || 0
        };
    });

    const currentShip =
        ships.find(ship => ship.equipped) ||
        ships.find(ship => ship.name === selectedShip && ship.owned) ||
        ships.find(ship => ship.owned);

    const ownedCount = ships.filter(ship => ship.owned).length;

    if (loading) {
        return (
            <section className="premium-hangar" id="spaceships">
                <h2>SPACESHIP HANGAR</h2>
                <p>Loading your fleet...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="premium-hangar" id="spaceships">
                <h2>SPACESHIP HANGAR</h2>
                <p>{error}</p>
            </section>
        );
    }

    if (!currentShip) {
        return (
            <section className="premium-hangar" id="spaceships">
                <h2>SPACESHIP HANGAR</h2>
                <p>No spaceship data is available. Please refresh the page.</p>
            </section>
        );
    }

    return (
        <section className="premium-hangar" id="spaceships">

            <div className="hangar-heading">
                <div>
                    <p className="hangar-eyebrow">
                        FLEET MANAGEMENT / 05 UNITS
                    </p>
                    <h2>SPACESHIP <span>HANGAR</span></h2>
                    <p>Choose your spacecraft. Prepare for deployment.</p>
                </div>

                <div className="hangar-status">
                    <span className="hangar-status-dot" />
                    FLEET SYSTEM ONLINE
                </div>
            </div>

            <div
                className="hangar-featured"
                style={{ "--ship-color": currentShip.color }}
            >
                <div className="featured-art">
                    <div className="featured-orbit" />
                    <div className="featured-grid" />

                    <ShipArtwork
                        color={currentShip.color}
                        locked={false}
                        ship={currentShip}
                    />

                    <span className="featured-art-label">
                        HOLOGRAPHIC PROJECTION
                    </span>
                </div>

                <div className="featured-info">
                    <div className="featured-topline">
                        <span className="ship-rarity">
                            {currentShip.rarity}
                        </span>
                        <span className="ship-serial">
                            {currentShip.codename}
                        </span>
                    </div>

                    <p className="featured-role">{currentShip.role}</p>
                    <h3>{currentShip.name}</h3>

                    <p className="featured-description">
                        {currentShip.description}
                    </p>

                    <div className="featured-stats">
                        <ShipStat
                            label="HULL INTEGRITY"
                            value={currentShip.health}
                            percent={Math.min(currentShip.health / 150 * 100, 100)}
                            color={currentShip.color}
                        />

                        <ShipStat
                            label="ENGINE SPEED"
                            value={currentShip.speed}
                            percent={Math.min(currentShip.speed / 15 * 100, 100)}
                            color={currentShip.color}
                        />

                        <ShipStat
                            label="WEAPON POWER"
                            value={currentShip.damage}
                            percent={Math.min(currentShip.damage / 30 * 100, 100)}
                            color={currentShip.color}
                        />
                    </div>

                    <div className="featured-footer">
                        <span>DEFENSE: {currentShip.defense}</span>
                        <span className="active-ship-label">
                            ● EQUIPPED SHIP
                        </span>
                    </div>

                    <button
                        className="hangar-details-button"
                        onClick={() => setShowShipDetails(!showShipDetails)}
                    >
                        {showShipDetails
                            ? "HIDE SPECIFICATIONS ↑"
                            : "VIEW SPECIFICATIONS →"}
                    </button>

                    {showShipDetails && (
                        <div className="hangar-extra-details">
                            <p>Unit designation: {currentShip.codename}</p>
                            <p>Combat role: {currentShip.role}</p>
                            <p>Maximum health: {currentShip.health}</p>
                            <p>Movement speed: {currentShip.speed}</p>
                            <p>Weapon damage: {currentShip.damage}</p>
                            <p>Upgrade level: {currentShip.upgradeLevel}</p>
                        </div>
                    )}

                    <div className="hangar-upgrades">
                        <p>SHIP UPGRADES</p>

                        {["HEALTH", "ATTACK", "SPEED"].map(type => (
                            <button
                                key={type}
                                className="fleet-select-button"
                                disabled={
                                    !currentShip.owned ||
                                    currentShip.upgradeLevel >= 5
                                }
                                onClick={() => onUpgrade(currentShip.id, type)}
                            >
                                UPGRADE {type}
                            </button>
                        ))}

                        <p>
                            Upgrade level: {currentShip.upgradeLevel}/5
                        </p>
                    </div>
                </div>
            </div>

            <div className="fleet-heading">
                <div>
                    <h3>YOUR FLEET</h3>
                    <p>Select a spacecraft to inspect its specifications.</p>
                </div>
                <span>{String(ownedCount).padStart(2, "0")} / 05 OWNED</span>
            </div>

            <div className="fleet-grid">
                {ships.map(ship => {
                    const isEquipped = ship.equipped;

                    return (
                        <article
                            key={ship.id}
                            className={`fleet-card ${
                                isEquipped ? "fleet-selected" : ""
                            } ${
                                !ship.owned ? "fleet-locked" : ""
                            }`}
                            style={{ "--ship-color": ship.color }}
                        >
                            <div className="fleet-card-top">
                                <span>{ship.codename}</span>
                                <span className="fleet-rarity">
                                    {ship.rarity}
                                </span>
                            </div>

                            <div className="fleet-art">
                                <ShipArtwork
                                    color={ship.color}
                                    locked={!ship.owned}
                                    ship={ship}
                                />

                                {!ship.owned && (
                                    <div className="fleet-lock-overlay">
                                        🔒
                                    </div>
                                )}
                            </div>

                            <div className="fleet-card-info">
                                <p className="fleet-role">{ship.role}</p>
                                <h4>{ship.name}</h4>

                                <p className="fleet-description">
                                    {ship.description}
                                </p>

                                <div className="fleet-mini-stats">
                                    <span>HP <strong>{ship.health}</strong></span>
                                    <span>SPD <strong>{ship.speed}</strong></span>
                                    <span>DMG <strong>{ship.damage}</strong></span>
                                </div>

                                {ship.owned ? (
                                    <button
                                        className={
                                            isEquipped
                                                ? "fleet-selected-button"
                                                : "fleet-select-button"
                                        }
                                        disabled={isEquipped}
                                        onClick={async () => {
                                            await onSelect(ship.id);
                                            setSelectedShip(ship.name);
                                            setShowShipDetails(false);
                                        }}
                                    >
                                        {isEquipped
                                            ? "✓ CURRENTLY EQUIPPED"
                                            : "EQUIP SPACECRAFT"}
                                    </button>
                                ) : (
                                    <div className="fleet-unlock">
                                        <span>🔒 NOT OWNED</span>
                                        <p>Price: {ship.price} Credits</p>

                                        <button
                                            className="fleet-select-button"
                                            disabled={credits < ship.price}
                                            onClick={() => onPurchase(ship.id)}
                                        >
                                            {credits >= ship.price
                                                ? "PURCHASE SHIP"
                                                : "NOT ENOUGH CREDITS"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
