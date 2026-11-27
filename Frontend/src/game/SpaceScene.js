import Phaser from "phaser";
import { completeMission as saveCompletedMission } from "./missionProgress.js";
import {
    completeGameSession,
    startGameSession
} from "../services/gameSessionService";

// ==========================================
// 1. ENEMY CONFIGURATION
// ==========================================

const ENEMY_SETTINGS = {
    scoutFighter: {
        health: 1, damage: 5, speed: 2.5,
        verticalSpeed: 0.7, score: 100,
        scale: 0.75, color: 0x00ff99,
        wingColor: 0x008855,
        pattern: "zigzag", range: 65
    },
    interceptor: {
        health: 2, damage: 8, speed: 3.5,
        verticalSpeed: 1, score: 200,
        scale: 0.9, color: 0xff1744,
        wingColor: 0x990033,
        pattern: "aggressive", range: 100
    },
    armoredCruiser: {
        health: 8, damage: 12, speed: 1.2,
        verticalSpeed: 0.4, score: 500,
        scale: 1.4, color: 0x9b59ff,
        wingColor: 0x542080,
        pattern: "slowSway", range: 35
    },
    longRangeGunship: {
        health: 4, damage: 10, speed: 1.6,
        verticalSpeed: 0.3, score: 350,
        scale: 1.15, color: 0xffa500,
        wingColor: 0x995500,
        pattern: "keepDistance", range: 80
    },
    eliteEnemy: {
        health: 12, damage: 15, speed: 2.8,
        verticalSpeed: 0.8, score: 1000,
        scale: 1.3, color: 0xff00ff,
        wingColor: 0x7700aa,
        pattern: "elite", range: 110
    }
};

// ==========================================
// 2. FOUR NORMAL WAVES
// ==========================================

const WAVE_PLANS = [
    // Wave 1 - Beginner
    [
        "scoutFighter", "scoutFighter", "scoutFighter",
        "scoutFighter", "interceptor", "scoutFighter",
        "interceptor", "scoutFighter", "scoutFighter",
        "interceptor"
    ],

    // Wave 2 - Easy to Medium
    [
        "scoutFighter", "interceptor", "interceptor",
        "scoutFighter", "armoredCruiser", "interceptor",
        "scoutFighter", "interceptor", "armoredCruiser",
        "scoutFighter", "interceptor", "scoutFighter"
    ],

    // Wave 3 - Medium
    [
        "interceptor", "armoredCruiser", "longRangeGunship",
        "interceptor", "armoredCruiser", "interceptor",
        "longRangeGunship", "armoredCruiser", "interceptor",
        "eliteEnemy", "longRangeGunship", "armoredCruiser",
        "interceptor", "longRangeGunship"
    ],

    // Wave 4 - Hard
    [
        "longRangeGunship", "longRangeGunship", "interceptor",
        "eliteEnemy", "armoredCruiser", "interceptor",
        "eliteEnemy", "longRangeGunship", "armoredCruiser",
        "interceptor", "eliteEnemy", "longRangeGunship",
        "armoredCruiser", "eliteEnemy", "interceptor",
        "longRangeGunship", "armoredCruiser"
    ]
];


// ==========================================
// 3. FIVE BOSSES
// ==========================================

const BOSS_LIST = [
    {
        name: "THE IRON WARDEN",
        color: 0xff5533,
        wingColor: 0x992211,
        health: 300,
        damage: 20,
        speed: 1.5,
        pattern: "sweep"
    },
    {
        name: "NEBULA SERPENT",
        color: 0x00ddff,
        wingColor: 0x005588,
        health: 350,
        damage: 22,
        speed: 2,
        pattern: "serpent"
    },
    {
        name: "SOLAR DEVOURER",
        color: 0xffcc00,
        wingColor: 0xaa5500,
        health: 400,
        damage: 24,
        speed: 2.2,
        pattern: "orbit"
    },
    {
        name: "THE RIFT CARRIER",
        color: 0xaa66ff,
        wingColor: 0x552299,
        health: 450,
        damage: 26,
        speed: 2.5,
        pattern: "zigzag"
    },
    {
        name: "VOID EMPEROR",
        color: 0xff00ff,
        wingColor: 0x660088,
        health: 550,
        damage: 30,
        speed: 3,
        pattern: "emperor"
    }
];

// ==========================================
// 4. POWER-UP CONFIGURATION
// ==========================================

const POWERUP_SETTINGS = {
    shield: {
        name: "Shield Pulse",
        duration: 6000,
        cooldown: 12000,
        uses: 3
    },
    rapidFire: {
        name: "Rapid Fire",
        duration: 7000,
        cooldown: 12000,
        uses: 3
    },
    spreadShot: {
        name: "Spread Shot",
        duration: 7000,
        cooldown: 12000,
        uses: 3
    },
    homing: {
        name: "Homing Missiles",
        duration: 0,
        cooldown: 10000,
        uses: 3
    },
    emp: {
        name: "EMP Blast",
        duration: 0,
        cooldown: 15000,
        uses: 2
    },
    repair: {
        name: "Repair Drone",
        duration: 0,
        cooldown: 15000,
        uses: 2
    },
    overdrive: {
        name: "Overdrive",
        duration: 6000,
        cooldown: 15000,
        uses: 2
    },
    warp: {
        name: "Emergency Warp",
        duration: 2500,
        cooldown: 15000,
        uses: 2
    }
};

// ==========================================
// 5. COMBAT PICKUP CONFIGURATION
// ==========================================

const PICKUP_SETTINGS = {
    credit: { name: "Credit Cache", color: 0xffd700 },
    energy: { name: "Energy Core", color: 0x00ffff },
    shield: { name: "Temporary Shield", color: 0x3399ff },
    weapon: { name: "Weapon Upgrade", color: 0xff00ff },
    rapid: { name: "Rapid-Fire Module", color: 0xff8800 },
    repair: { name: "Repair Module", color: 0x00ff66 }
};

// ==========================================
// 6. MAIN GAME SCENE
// ==========================================

class SpaceScene extends Phaser.Scene {

    constructor() {
        super("SpaceScene");
    }

    // Receive the selected mission from React / PhaserGame
    init(data) {
       this.selectedShip = data?.selectedShip || "Interceptor";
this.selectedMission = data?.selectedMission || null;
this.sessionId = data?.sessionId || null;

        // Mission IDs currently follow:
        // sector-1-mission-01
        const missionId = this.selectedMission?.id || "sector-1-mission-01";

        const match = missionId.match(
            /sector-(\d+)-mission-(\d+)/
        );

        const sectorNumber = match ? Number(match[1]) : 1;
        const missionWithinSector = match ? Number(match[2]) : 1;

        this.missionNumber =
            (sectorNumber - 1) * 10 + missionWithinSector;

        this.sectorNumber = sectorNumber;
    }

   create() {

    this.cameras.main.setBackgroundColor("#08091F");

        // Background stars
        this.stars = [];

        for (let i = 0; i < 100; i++) {
            const star = this.add.circle(
                Phaser.Math.Between(0, 900),
                Phaser.Math.Between(0, 600),
                Phaser.Math.Between(1, 2),
                0xffffff
            );

            star.setAlpha(Phaser.Math.FloatBetween(0.3, 1));
            this.stars.push(star);
        }

        // ==========================================
        // PLAYER SPACESHIP - FIVE UNIQUE DESIGNS
        // ==========================================

        const selectedShipData = this.selectedShip;

        // Accept either a ship name or a ship object from React
        const shipName = typeof selectedShipData === "string"
    ? selectedShipData
    : selectedShipData?.name ||
      selectedShipData?.shipName ||
      selectedShipData?.shipClass ||
      selectedShipData?.className ||
      "Interceptor";

this.selectedShip = shipName;

        this.ship = this.add.container(450, 500);

        const playerGraphics = this.add.graphics();

        const shipColors = {
            "Interceptor": {
                main: 0x20d9ff,
                dark: 0x0878b5,
                light: 0xa8f5ff,
                engine: 0x00d9ff
            },
            "Striker": {
                main: 0xff704d,
                dark: 0x9e251c,
                light: 0xffc09c,
                engine: 0xff4400
            },
            "Guardian": {
                main: 0x65e6a5,
                dark: 0x176b49,
                light: 0xc5ffe0,
                engine: 0x36ff9b
            },
            "Support Craft": {
                main: 0xb58aff,
                dark: 0x6035a5,
                light: 0xe5d5ff,
                engine: 0xb58aff
            },
            "Experimental Ship": {
                main: 0xffd36a,
                dark: 0x9e6c18,
                light: 0xffffff,
                engine: 0xffaa22
            }
        };

        const colors =
            shipColors[shipName] || shipColors["Interceptor"];

        switch (shipName) {


    // ======================================
    // 1. INTERCEPTOR - SLIM SPEED FIGHTER
    // ======================================
    case "Interceptor":

        // Rear engine flames
        playerGraphics.fillStyle(0x007bff, 0.8);
        playerGraphics.fillTriangle(-9, 19, -4, 47, 0, 19);
        playerGraphics.fillTriangle(9, 19, 4, 47, 0, 19);

        // Sharp swept wings
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillTriangle(-10, -5, -48, 29, -13, 22);
        playerGraphics.fillTriangle(10, -5, 48, 29, 13, 22);

        // Wing armor
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(-14, 8, -43, 29, -16, 24);
        playerGraphics.fillTriangle(14, 8, 43, 29, 16, 24);

        // Main narrow hull
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -49, -14, 28, 14, 28);

        // Central cockpit
        playerGraphics.fillStyle(0x102b48, 1);
        playerGraphics.fillTriangle(0, -32, -7, 1, 7, 1);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillTriangle(0, -28, -4, -5, 4, -5);

        // Engine center
        playerGraphics.fillStyle(colors.engine, 1);
        playerGraphics.fillEllipse(0, 29, 9, 13);

        break;


    // ======================================
    // 2. STRIKER - HEAVY ASSAULT FIGHTER
    // ======================================
    case "Striker":

        // Twin rear engines
        playerGraphics.fillStyle(colors.engine, 0.9);
        playerGraphics.fillTriangle(-19, 20, -12, 48, -5, 20);
        playerGraphics.fillTriangle(19, 20, 12, 48, 5, 20);

        // Heavy wide wings
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillTriangle(-13, -9, -49, 31, -13, 26);
        playerGraphics.fillTriangle(13, -9, 49, 31, 13, 26);

        // Wing armor plates
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(-15, 3, -43, 26, -16, 22);
        playerGraphics.fillTriangle(15, 3, 43, 26, 16, 22);

        // Main armored hull
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -43, -20, 30, 20, 30);

        // Heavy central armor
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillRoundedRect(-13, -4, 26, 31, 6);

        // Cockpit
        playerGraphics.fillStyle(0x381b24, 1);
        playerGraphics.fillRoundedRect(-7, -31, 14, 27, 5);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillEllipse(0, -21, 8, 13);

        // Twin weapon cannons
        playerGraphics.fillStyle(0xe5e9ef, 1);
        playerGraphics.fillRect(-39, 8, 7, 20);
        playerGraphics.fillRect(32, 8, 7, 20);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillCircle(-35.5, 9, 4);
        playerGraphics.fillCircle(35.5, 9, 4);

        break;


    // ======================================
    // 3. GUARDIAN - ARMORED DEFENSE SHIP
    // ======================================
    case "Guardian":

        // Powerful rear engines
        playerGraphics.fillStyle(colors.engine, 0.85);
        playerGraphics.fillTriangle(-17, 20, -12, 44, -5, 20);
        playerGraphics.fillTriangle(17, 20, 12, 44, 5, 20);

        // Large armored side panels
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillRoundedRect(-48, -4, 25, 43, 7);
        playerGraphics.fillRoundedRect(23, -4, 25, 43, 7);

        // Main shield-shaped hull
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -43, -29, 1, -23, 29);
        playerGraphics.fillTriangle(0, -43, 29, 1, 23, 29);
        playerGraphics.fillRoundedRect(-23, -12, 46, 40, 8);

        // Heavy central armor
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillRoundedRect(-16, -9, 32, 28, 7);

        // Cockpit
        playerGraphics.fillStyle(0x163c32, 1);
        playerGraphics.fillTriangle(0, -34, -10, -4, 10, -4);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillTriangle(0, -29, -5, -9, 5, -9);

        // Defensive side lights
        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillCircle(-35, 9, 5);
        playerGraphics.fillCircle(35, 9, 5);

        // Shield marking
        playerGraphics.lineStyle(2, colors.light, 0.9);
        playerGraphics.lineBetween(-12, 16, 0, 23);
        playerGraphics.lineBetween(0, 23, 12, 16);

        break;


    // ======================================
    // 4. SUPPORT CRAFT - TACTICAL POD SHIP
    // ======================================
    case "Support Craft":

        // Rear center engine
        playerGraphics.fillStyle(colors.engine, 0.9);
        playerGraphics.fillTriangle(-8, 19, 0, 47, 8, 19);

        // Side support engines
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillEllipse(-32, 12, 23, 39);
        playerGraphics.fillEllipse(32, 12, 23, 39);

        // Side pod highlights
        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillEllipse(-32, 11, 9, 20);
        playerGraphics.fillEllipse(32, 11, 9, 20);

        // Wide tactical wings
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(-12, -12, -49, 23, -16, 28);
        playerGraphics.fillTriangle(12, -12, 49, 23, 16, 28);

        // Central body
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillRoundedRect(-17, -29, 34, 57, 8);

        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -46, -17, 17, 17, 17);

        // Cockpit
        playerGraphics.fillStyle(0x30234b, 1);
        playerGraphics.fillRoundedRect(-8, -29, 16, 27, 7);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillEllipse(0, -19, 9, 13);

        // Tactical side lights
        playerGraphics.fillStyle(0xffffff, 1);
        playerGraphics.fillCircle(-32, 1, 4);
        playerGraphics.fillCircle(32, 1, 4);

        break;


    // ======================================
    // 5. EXPERIMENTAL - ADVANCED PROTOTYPE
    // ======================================
    case "Experimental Ship":

        // Triple energy engines
        playerGraphics.fillStyle(colors.engine, 0.9);
        playerGraphics.fillTriangle(-17, 18, -12, 47, -5, 18);
        playerGraphics.fillTriangle(17, 18, 12, 47, 5, 18);
        playerGraphics.fillTriangle(-5, 22, 0, 52, 5, 22);

        // Angular experimental wings
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillTriangle(-9, -12, -50, 30, -13, 19);
        playerGraphics.fillTriangle(9, -12, 50, 30, 13, 19);

        // Outer energy armor
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -51, -20, 23, 0, 36);
        playerGraphics.fillTriangle(0, -51, 20, 23, 0, 36);

        // Advanced side panels
        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillTriangle(-14, 1, -41, 25, -15, 19);
        playerGraphics.fillTriangle(14, 1, 41, 25, 15, 19);

        // Central prototype hull
        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -47, -13, 27, 13, 27);

        // Advanced cockpit
        playerGraphics.fillStyle(0x352a13, 1);
        playerGraphics.fillTriangle(0, -34, -8, -1, 8, -1);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillTriangle(0, -29, -4, -7, 4, -7);

        // Energy core
        playerGraphics.fillStyle(0xffffff, 1);
        playerGraphics.fillCircle(0, 10, 5);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillCircle(0, 10, 9);

        break;


    // ======================================
    // DEFAULT - INTERCEPTOR
    // ======================================
    default:

        playerGraphics.fillStyle(colors.engine, 0.9);
        playerGraphics.fillTriangle(-9, 19, -4, 43, 0, 19);
        playerGraphics.fillTriangle(9, 19, 4, 43, 0, 19);

        playerGraphics.fillStyle(colors.main, 1);
        playerGraphics.fillTriangle(0, -40, -14, 28, 14, 28);

        playerGraphics.fillStyle(colors.dark, 1);
        playerGraphics.fillTriangle(-8, -5, -38, 25, -12, 17);
        playerGraphics.fillTriangle(8, -5, 38, 25, 12, 17);

        playerGraphics.fillStyle(colors.light, 1);
        playerGraphics.fillEllipse(0, -8, 12, 25);

        break;
}

// Unique engine flames for each spaceship
const engineFlame = this.add.graphics();

switch (this.selectedShip) {

    // 1. INTERCEPTOR - Blue/Cyan twin flames
    case "Interceptor":
        engineFlame.fillStyle(0x0088ff, 1);
        engineFlame.fillTriangle(-12, 22, -5, 65, 0, 22);
        engineFlame.fillTriangle(12, 22, 5, 65, 0, 22);

        engineFlame.fillStyle(0x00ffff, 1);
        engineFlame.fillTriangle(-7, 25, -3, 52, 0, 25);
        engineFlame.fillTriangle(7, 25, 3, 52, 0, 25);
        break;

    // 2. STRIKER - Powerful orange/red flames
    case "Striker":
        engineFlame.fillStyle(0xff2200, 1);
        engineFlame.fillTriangle(-20, 25, -10, 75, 0, 25);
        engineFlame.fillTriangle(20, 25, 10, 75, 0, 25);

        engineFlame.fillStyle(0xff9900, 1);
        engineFlame.fillTriangle(-12, 27, -5, 60, 0, 27);
        engineFlame.fillTriangle(12, 27, 5, 60, 0, 27);
        break;

    // 3. GUARDIAN - Green energy flames
    case "Guardian":
        engineFlame.fillStyle(0x00cc66, 1);
        engineFlame.fillTriangle(-18, 25, -9, 58, 0, 25);
        engineFlame.fillTriangle(18, 25, 9, 58, 0, 25);

        engineFlame.fillStyle(0x99ff66, 1);
        engineFlame.fillTriangle(-9, 27, -4, 48, 0, 27);
        engineFlame.fillTriangle(9, 27, 4, 48, 0, 27);
        break;

    // 4. SUPPORT CRAFT - Purple energy flames
    case "Support Craft":
        engineFlame.fillStyle(0x9933ff, 1);
        engineFlame.fillTriangle(-25, 20, -18, 60, -10, 20);
        engineFlame.fillTriangle(25, 20, 18, 60, 10, 20);
        engineFlame.fillTriangle(-7, 25, 0, 48, 7, 25);

        engineFlame.fillStyle(0xdd99ff, 1);
        engineFlame.fillTriangle(-22, 23, -18, 48, -14, 23);
        engineFlame.fillTriangle(22, 23, 18, 48, 14, 23);
        break;

    // 5. EXPERIMENTAL SHIP - Pink/Cyan energy flames
    case "Experimental Ship":
        engineFlame.fillStyle(0xff00cc, 1);
        engineFlame.fillTriangle(-16, 25, -8, 70, 0, 25);
        engineFlame.fillTriangle(16, 25, 8, 70, 0, 25);

        engineFlame.fillStyle(0x00ffff, 1);
        engineFlame.fillTriangle(-8, 27, -3, 55, 0, 27);
        engineFlame.fillTriangle(8, 27, 3, 55, 0, 27);
        break;

    default:
        engineFlame.fillStyle(0xff6600, 1);
        engineFlame.fillTriangle(-10, 25, -4, 55, 0, 25);
        engineFlame.fillTriangle(10, 25, 4, 55, 0, 25);
}

// Add spaceship and its engine flames
this.ship.add([engineFlame, playerGraphics]);
this.ship.setDepth(10);

// ==========================================
// SHIP-SPECIFIC GAMEPLAY ATTRIBUTES
// ==========================================

// Ship movement speeds
this.shipMovementSpeed = {
    "Interceptor": 6,
    "Striker": 5,
    "Guardian": 3.5,
    "Support Craft": 4.5,
    "Experimental Ship": 5.5
}[this.selectedShip] ?? 5;


// Ship weapon damage
this.shipDamage = {
    "Interceptor": 1,
    "Striker": 2,
    "Guardian": 1,
    "Support Craft": 1,
    "Experimental Ship": 2
}[this.selectedShip] ?? 1;


// Ship defensive strength
this.shipDamageReduction = {
    "Interceptor": 0,
    "Striker": 0,
    "Guardian": 0.30,
    "Support Craft": 0.10,
    "Experimental Ship": 0.15
}[this.selectedShip] ?? 0;

        
        // Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys("W,A,S,D");
        // Reinitialize movement controls for every mission
this.movementKeys = this.input.keyboard.addKeys({
    up: Phaser.Input.Keyboard.KeyCodes.W,
    down: Phaser.Input.Keyboard.KeyCodes.S,
    left: Phaser.Input.Keyboard.KeyCodes.A,
    right: Phaser.Input.Keyboard.KeyCodes.D,
    arrowUp: Phaser.Input.Keyboard.KeyCodes.UP,
    arrowDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
    arrowLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
    arrowRight: Phaser.Input.Keyboard.KeyCodes.RIGHT
});

// Mobile touch controls
this.touchMovePointer = null;
this.touchFireActive = false;
this.touchStartPosition = null;
this.touchMoveSpeed = this.shipMovementSpeed || 5;


        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );

        // Power-up keyboard keys: 1 to 8
this.powerKeys = {
    1: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
    2: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
    3: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
    4: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
    5: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
    6: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
    7: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN),
    8: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT)
};

        // Game data
        this.bullets = [];
        this.enemies = [];
        this.pickups = [];
        this.missiles = [];
        this.bossBombs = [];

        this.boss = null;
            
        this.score = 0;
this.enemiesDefeated = 0;
this.bossesDefeated = 0;
this.damageTaken = 0;
this.resultSubmitted = false;

// Ship-specific health and durability
const shipHealth = {
    "Interceptor": 100,
    "Striker": 80,
    "Guardian": 150,
    "Support Craft": 110,
    "Experimental Ship": 120
};

this.maxHealth = shipHealth[this.selectedShip] ?? 100;
this.health = this.maxHealth;

        this.creditsCollected = 0;
        this.energyCollected = 0;

        
        this.waveNumber = 0;

        this.gameOver = false;
        this.missionCompleted = false;

        this.isPaused = false;

        this.lastPlayerShot = 0;
        this.fireInterval = 120;
        this.playerInvulnerableUntil = 0;

        this.waveQueue = [];
        this.nextSpawnTime = 0;
        this.waveCompleteAt = null;

        this.maxActiveEnemies = 3;
        this.spawnSide = 1;

        this.bossHealthGraphics = null;

        // Power-up state
        this.powerups = {};

        Object.keys(POWERUP_SETTINGS).forEach(key => {
            this.powerups[key] = {
                uses: POWERUP_SETTINGS[key].uses,
                lastUsed: -999999,
                activeUntil: 0
            };
        });

        this.baseFireInterval = 120;
        this.weaponLevel = 1;
        this.shieldActiveUntil = 0;

        // UI will be created in Section 2.
        this.createGameUI();

        this.shieldActiveUntil = 0;
this.playerInvulnerableUntil = 0;

this.shieldGraphic = this.add.circle(
    this.ship.x,
    this.ship.y,
    45
);

this.shieldGraphic.setStrokeStyle(3, 0x00ffff, 0.9);
this.shieldGraphic.setFillStyle(0x00ffff, 0.08);
this.shieldGraphic.setDepth(9);
this.shieldGraphic.setVisible(false);

        // Start first wave
        this.startWave(1);
    }

        // ==========================================
    // 7. GAME UI
    // ==========================================
        
createGameUI() {
// ==========================================
// MOBILE TOUCH CONTROLS
// ==========================================




// Release firing when finger leaves the game
this.input.on("pointerup", (pointer) => {

    if (this.touchMovePointer === pointer.id) {
        this.touchMovePointer = null;
        this.touchFireActive = false;
    }

});

// Stop firing when pointer leaves the game
this.input.on("gameout", () => {
    this.touchFireActive = false;
});
// ==========================================
// MOBILE TOUCH-TO-MOVE CONTROLS
// ==========================================

this.input.on("pointerdown", (pointer) => {

    if (
        !this.gameOver &&
        !this.isPaused &&
        !this.missionCompleted
    ) {
        this.touchMovePointer = pointer.id;
        this.touchFireActive = true;
    }

});
// ==========================================
// MOBILE TOUCH MOVEMENT + AUTO SHOOTING
// ==========================================

this.input.on("pointermove", (pointer) => {
    if (
        this.touchMovePointer === pointer.id &&
        pointer.isDown &&
        this.ship &&
        !this.gameOver &&
        !this.isPaused &&
        !this.missionCompleted
    ) {
        // Move spaceship with finger
        this.ship.x = Phaser.Math.Clamp(pointer.worldX, 35, 865);
        this.ship.y = Phaser.Math.Clamp(pointer.worldY, 300, 570);

        // Automatically shoot while finger is touching and moving
        this.touchFireActive = true;
    }
});
    // HUD background panels
    this.hudGraphics = this.add.graphics().setDepth(19);

    this.hudGraphics.fillStyle(0x08091f, 0.88);
    this.hudGraphics.fillRoundedRect(12, 12, 260, 88, 12);
    this.hudGraphics.lineStyle(1, 0x00d9ff, 0.55);
    this.hudGraphics.strokeRoundedRect(12, 12, 260, 88, 12);

    this.hudGraphics.fillStyle(0x08091f, 0.88);
    this.hudGraphics.fillRoundedRect(650, 12, 235, 75, 12);
    this.hudGraphics.lineStyle(1, 0x8b5cf6, 0.65);
    this.hudGraphics.strokeRoundedRect(650, 12, 235, 75, 12);

    // Score
    this.scoreText = this.add.text(28, 24, "SCORE: 0", {
        fontSize: "22px",
        color: "#00eaff",
        fontStyle: "bold"
    }).setDepth(20);

    // Health label
    this.healthText = this.add.text(
        28, 57,
        "HEALTH: " + this.health + " / " + this.maxHealth,
        {
            fontSize: "16px",
            color: "#8cffbd",
            fontStyle: "bold"
        }
    ).setDepth(20);

    // Graphical health bar
    this.healthBarBackground = this.add.graphics().setDepth(20);
    this.healthBarFill = this.add.graphics().setDepth(21);
    this.updateHealthUI();

    // Mission and wave information
    this.missionText = this.add.text(
        767, 27,
        "MISSION: " + this.missionNumber,
        {
            fontSize: "17px",
            color: "#ffffff",
            fontStyle: "bold",
            align: "center"
        }
    ).setOrigin(0.5).setDepth(20);

    this.waveText = this.add.text(767, 54, "WAVE: 1 / 5", {
        fontSize: "17px",
        color: "#ffe66d",
        fontStyle: "bold",
        align: "center"
    }).setOrigin(0.5).setDepth(20);

    // Centre notifications
    this.messageText = this.add.text(450, 250, "", {
        fontSize: "34px",
        color: "#00ffff",
        fontStyle: "bold",
        backgroundColor: "#08091F",
        padding: { x: 20, y: 12 },
        align: "center"
    }).setOrigin(0.5).setDepth(80);

    // Boss information
    this.bossNameText = this.add.text(450, 90, "", {
        fontSize: "23px",
        color: "#ff5555",
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(30).setVisible(false);

    this.bossHealthGraphics = this.add.graphics()
        .setDepth(30)
        .setVisible(false);

    // Power-up inventory (existing system retained)
    this.powerupText = this.add.text(20, 115, "", {
        fontSize: "14px",
        color: "#ffffff",
        lineSpacing: 5,
        backgroundColor: "#15152e",
        padding: { x: 8, y: 6 }
    }).setDepth(30);

    this.pickupMessage = this.add.text(450, 550, "", {
        fontSize: "18px",
        color: "#00ff99",
        fontStyle: "bold",
        backgroundColor: "#08091F",
        padding: { x: 8, y: 5 }
    }).setOrigin(0.5).setDepth(40);

    // Game-over screen
    this.gameOverText = this.add.text(450, 280, "GAME OVER", {
        fontSize: "55px",
        color: "#ff1744",
        fontStyle: "bold",
        backgroundColor: "#08091F",
        padding: { x: 20, y: 15 }
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.gameOverScore = this.add.text(450, 345, "", {
        fontSize: "23px",
        color: "#ffffff"
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.restartText = this.add.text(450, 420, "RESTART GAME", {
        fontSize: "26px",
        color: "#ffffff",
        backgroundColor: "#6c35ff",
        padding: { x: 25, y: 15 },
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(101).setVisible(false);

    this.restartText.setInteractive({ useHandCursor: true });

    this.restartText.on("pointerdown", () => {
        this.restartCurrentMission();
    });

    // Mission-completion screen
    this.completedText = this.add.text(450, 250, "", {
        fontSize: "42px",
        color: "#00ff99",
        fontStyle: "bold",
        backgroundColor: "#08091F",
        padding: { x: 20, y: 15 }
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.completedScoreText = this.add.text(450, 320, "", {
        fontSize: "24px",
        color: "#ffffff"
    }).setOrigin(0.5).setDepth(100).setVisible(false);

    this.nextMissionText = this.add.text(310, 440, "NEXT MISSION", {
        fontSize: "23px",
        color: "#ffffff",
        backgroundColor: "#6c35ff",
        padding: { x: 20, y: 15 },
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(101).setVisible(false);

    this.nextMissionText.setInteractive({ useHandCursor: true });

    this.playAgainText = this.add.text(610, 440, "PLAY AGAIN", {
        fontSize: "23px",
        color: "#ffffff",
        backgroundColor: "#087f5b",
        padding: { x: 20, y: 15 },
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(101)
        .setVisible(false)
        .setInteractive({ useHandCursor: true });

    this.playAgainText.on("pointerdown", () => {
        if (!this.missionCompleted) return;
        this.restartCurrentMission();
    });

    this.nextMissionText.on("pointerdown", () => {
        if (!this.missionCompleted) return;
        this.startNewMission();
    });

    // Pause controls
    this.pauseText = this.add.text(865, 105, "II", {
        fontSize: "22px",
        color: "#ffffff",
        backgroundColor: "#6c35ff",
        padding: { x: 12, y: 8 },
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(120).setInteractive({
        useHandCursor: true
    });

    this.pauseOverlay = this.add.rectangle(
        450, 300, 900, 600, 0x000000, 0.8
    ).setDepth(120).setVisible(false);

    this.pausedTitle = this.add.text(450, 240, "GAME PAUSED", {
        fontSize: "42px",
        color: "#00ffff",
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(121).setVisible(false);

    this.resumeText = this.add.text(450, 330, "RESUME GAME", {
        fontSize: "25px",
        color: "#ffffff",
        backgroundColor: "#087f5b",
        padding: { x: 25, y: 15 },
        fontStyle: "bold"
    }).setOrigin(0.5).setDepth(121).setVisible(false)
        .setInteractive({ useHandCursor: true });

    this.pauseText.on("pointerdown", () => {
        this.togglePause();
    });

    this.resumeText.on("pointerdown", () => {
        this.togglePause();
    });

    this.updatePowerupUI();
}


    // ==========================================
    // 8. POWER-UP INVENTORY UI
    // ==========================================
// ==========================================
updatePowerupUI() {
    if (this.powerupText) {
        this.powerupText.setVisible(false);
    }
}
    // ==========================================
// 10. START NORMAL WAVE
// ==========================================


async restartCurrentMission() {

    const sectorNumber = Math.ceil(this.missionNumber / 10);

    const missionWithinSector =
        ((this.missionNumber - 1) % 10) + 1;

    const missionId =
        this.selectedMission?.id ||
        `sector-${sectorNumber}-mission-${String(missionWithinSector).padStart(2, "0")}`;

    this.messageText.setText("RESTARTING MISSION...");
    this.messageText.setVisible(true);

    try {
        const response = await startGameSession(
            missionId,
            this.selectedShip
        );

        if (!response.sessionId) {
            throw new Error("New session ID was not returned.");
        }

        this.scene.restart({
            selectedShip: this.selectedShip,
            selectedMission: {
                ...(this.selectedMission || {}),
                id: missionId
            },
            sessionId: response.sessionId
        });

    } catch (error) {
        console.error("Mission restart failed:", error);
        this.messageText.setText("RESTART FAILED - CHECK CONNECTION");
        this.messageText.setVisible(true);
    }
}




async startNewMission() {

    if (!this.missionCompleted) return;

    this.nextMissionText.setVisible(false);
    this.playAgainText.setVisible(false);
    this.nextMissionText.disableInteractive();

    this.messageText.setText("PREPARING NEXT MISSION...");
    this.messageText.setVisible(true);

    const nextMissionNumber = this.missionNumber + 1;

    const sectorNumber = Math.ceil(nextMissionNumber / 10);

    const missionWithinSector =
        ((nextMissionNumber - 1) % 10) + 1;

    const missionId =
        `sector-${sectorNumber}-mission-${String(missionWithinSector).padStart(2, "0")}`;

    try {
        const response = await startGameSession(
            missionId,
            this.selectedShip
        );

        if (!response.sessionId) {
            throw new Error("Backend did not return a new session ID.");
        }

        const nextMission = {
            ...(this.selectedMission || {}),
            id: missionId
        };

        this.scene.restart({
            selectedShip: this.selectedShip,
            selectedMission: nextMission,
            sessionId: response.sessionId
        });

    } catch (error) {
        console.error("Unable to start next mission:", error);

        this.messageText.setText(
            "NEXT MISSION FAILED TO START. CHECK CONNECTION."
        );
        this.messageText.setVisible(true);

        this.nextMissionText.setVisible(true);
        this.nextMissionText.setInteractive({
            useHandCursor: true
        });
    }
}
startWave(waveNumber) {

    if (this.gameOver || this.missionCompleted) return;

    // The fifth wave is the boss wave
    if (waveNumber > 4) {
        this.startBossWave();
        return;
    }

    this.waveNumber = waveNumber;
    this.waveActive = true;
    this.waveCompleteAt = null;

    this.waveText.setText(
        "WAVE: " + waveNumber + " / 5"
    );

    this.waveQueue = [...WAVE_PLANS[waveNumber - 1]];
    this.waveKills = 0;
this.waveRequiredKills = this.waveQueue.length;

    this.nextSpawnTime = this.time.now + 1000;

    this.messageText.setText("WAVE " + waveNumber);
    this.messageText.setVisible(true);

    this.time.delayedCall(1200, () => {
        if (!this.gameOver && !this.missionCompleted) {
            this.messageText.setVisible(false);
        }
    });
}


      // ==========================================
    // 11. SPAWN ENEMIES FROM ALL FOUR DIRECTIONS
    // ==========================================

    spawnNextEnemy(time) {

        // Stop if there are no enemies left in the queue
        if (this.waveQueue.length === 0) return;

        // Limit the number of enemies on screen
        if (this.enemies.length >= this.maxActiveEnemies) return;

        // Wait until the next spawn time
        if (time < this.nextSpawnTime) return;

        // Get the next enemy type
        const type = this.waveQueue.shift();

        // Cycle through four directions:
        // 0 = Top, 1 = Right, 2 = Bottom, 3 = Left
        const side = this.spawnSide % 3;

       this.spawnSide = (this.spawnSide + 1) % 3;

        let x;
        let y;

        // ======================================
        // TOP SIDE
        // ======================================

        if (side === 0) {

            x = Phaser.Math.Between(80, 820);
            y = -60;

        }

        // ======================================
        // RIGHT SIDE
        // ======================================

        else if (side === 1) {

            x = 960;
            y = Phaser.Math.Between(80, 520);

        }

        

        // ======================================
        // LEFT SIDE
        // ======================================

        else {

            x = -60;
            y = Phaser.Math.Between(80, 520);

        }

        // Choose a random target inside the game screen
        const targetX = Phaser.Math.Between(100, 800);
        const targetY = Phaser.Math.Between(100, 500);

        // Create the enemy spaceship
        const enemy = this.createEnemy(
            type,
            x,
            y,
            side,
            targetX
        );

        if (enemy) {

            enemy.enemyType = type;
            // Calculate the direction towards the target
            const angle = Phaser.Math.Angle.Between(
                x,
                y,
                targetX,
                targetY
            );

            // Set enemy movement speed and direction
            enemy.velocityX = Math.cos(angle) * enemy.speed;
            enemy.velocityY = Math.sin(angle) * enemy.speed;

            // Rotate the spaceship towards its movement direction
            enemy.rotation = angle - Math.PI / 2;

            // Add the enemy to the active enemy list
            this.enemies.push(enemy);
        }

        // Set the delay before spawning another enemy
        this.nextSpawnTime = time + 1700;
    }


   

    // ==========================================
    // 12. CREATE ENEMY
    // ==========================================

    createEnemy(type, x, y, entryDirection, targetX) {

        const settings = ENEMY_SETTINGS[type];

        if (!settings) return null;

        const enemy = this.add.container(x, y);
        const graphics = this.add.graphics();

        const mainColor = settings.color;
        const wingColor = settings.wingColor;

        if (type === "scoutFighter") {

            graphics.fillStyle(mainColor, 1);
            graphics.fillTriangle(0, 30, -13, -20, 13, -20);

            graphics.fillStyle(wingColor, 1);
            graphics.fillTriangle(-8, 0, -35, -15, -12, 15);
            graphics.fillTriangle(8, 0, 35, -15, 12, 15);

            graphics.fillStyle(0xffffff, 1);
            graphics.fillEllipse(0, -5, 9, 17);

        } else if (type === "interceptor") {

            graphics.fillStyle(mainColor, 1);
            graphics.fillTriangle(0, 38, -12, -25, 12, -25);

            graphics.fillStyle(wingColor, 1);
            graphics.fillTriangle(-8, 5, -48, -35, -18, -12);
            graphics.fillTriangle(8, 5, 48, -35, 18, -12);

            graphics.fillStyle(0xffffff, 1);
            graphics.fillEllipse(0, -5, 10, 20);

        } else if (type === "armoredCruiser") {

            graphics.fillStyle(wingColor, 1);
            graphics.fillRect(-45, -15, 90, 35);

            graphics.fillStyle(mainColor, 1);
            graphics.fillRoundedRect(-25, -30, 50, 65, 8);

            graphics.fillStyle(0xd9c4ff, 1);
            graphics.fillRect(-18, -15, 12, 28);
            graphics.fillRect(6, -15, 12, 28);

            graphics.fillStyle(0xffffff, 1);
            graphics.fillEllipse(0, 0, 15, 25);

        } else if (type === "longRangeGunship") {

            graphics.fillStyle(wingColor, 1);
            graphics.fillTriangle(-10, 5, -55, -20, -35, 30);
            graphics.fillTriangle(10, 5, 55, -20, 35, 30);

            graphics.fillStyle(mainColor, 1);
            graphics.fillRoundedRect(-18, -35, 36, 75, 7);

            graphics.fillStyle(0xffdd55, 1);
            graphics.fillRect(-48, -12, 13, 35);
            graphics.fillRect(35, -12, 13, 35);

            graphics.fillStyle(0xffffff, 1);
            graphics.fillEllipse(0, -10, 13, 23);

        } else if (type === "eliteEnemy") {

            graphics.fillStyle(wingColor, 1);
            graphics.fillTriangle(-8, 5, -60, -35, -35, 25);
            graphics.fillTriangle(8, 5, 60, -35, 35, 25);

            graphics.fillStyle(mainColor, 1);
            graphics.fillTriangle(0, 45, -23, -30, 23, -30);

            graphics.fillStyle(0xff88ff, 1);
            graphics.fillTriangle(0, 15, -14, -15, 0, -25);
            graphics.fillTriangle(0, 15, 14, -15, 0, -25);

            graphics.fillStyle(0xffffff, 1);
            graphics.fillEllipse(0, -8, 14, 24);
        }

        enemy.add(graphics);
        enemy.setScale(settings.scale);
        enemy.setDepth(5);

        const missionScale =
            1 + (this.missionNumber - 1) * 0.08;

        enemy.enemyType = type;
        enemy.health = Math.ceil(settings.health * missionScale);
        enemy.maxHealth = enemy.health;

        enemy.damage = Math.min(
            25,
            Math.round(settings.damage * missionScale)
        );

        enemy.speed = settings.speed * missionScale;
        enemy.verticalSpeed = settings.verticalSpeed;

        enemy.scoreValue = Math.round(
            settings.score * missionScale
        );

        enemy.pattern = settings.pattern;
enemy.horizontalSpeed = settings.speed;
enemy.movementPattern = settings.pattern;
enemy.movementRange = settings.range;

        enemy.entryDirection = entryDirection;
        enemy.targetX = targetX;

        enemy.movementState = "approach";
        enemy.baseX = targetX;
        enemy.baseY = y;

        enemy.movementPhase =
            Phaser.Math.FloatBetween(0, Math.PI * 2);

        return enemy;
    }

    // ==========================================
    // 13. RESET ENEMY ENTRY
    // ==========================================

    resetEnemyEntry(enemy) {

        enemy.entryDirection *= -1;

        enemy.x = enemy.entryDirection === 1 ? -60 : 960;

        enemy.y = Phaser.Math.Between(100, 350);
        enemy.targetX = Phaser.Math.Between(100, 800);

        enemy.movementState = "approach";
        enemy.baseX = enemy.targetX;
        enemy.baseY = enemy.y;

        enemy.movementPhase =
            Phaser.Math.FloatBetween(0, Math.PI * 2);
    }

    // ==========================================
    // 14. ACTIVATE POWER-UPS
    // ==========================================

    activatePowerup(key, fromPickup = false) {

        if (this.gameOver || this.missionCompleted) return;

        const settings = POWERUP_SETTINGS[key];
        const item = this.powerups[key];

        if (!settings || !item) return;

        const now = this.time.now;

        // Collected power-ups activate automatically
        if (!fromPickup) {

            if (item.uses <= 0) return;

            if (now - item.lastUsed < settings.cooldown) return;

            item.uses--;
        }

        item.lastUsed = now;
        item.activeUntil = now + settings.duration;

        switch (key) {

            case "shield":
                this.shieldActiveUntil = now + settings.duration;
                break;

            case "rapidFire":
                break;

            case "spreadShot":
                break;

            case "homing":
                this.launchHomingMissiles(2);
                break;

            case "emp":
                this.activateEMP();
                break;

            case "repair":
                this.health = Math.min(
                    this.maxHealth,
                    this.health + 30
                );
                this.updateHealthUI();
                break;

            case "overdrive":
                break;

            case "warp":
                this.ship.setPosition(
                    Phaser.Math.Between(100, 800),
                    Phaser.Math.Between(350, 540)
                );

                this.playerInvulnerableUntil =
                    now + settings.duration;
                break;
        }

        this.updatePowerupUI();
    }

    // ==========================================
    // 15. POWER-UP MESSAGE
    // ==========================================

    showPickupMessage(message) {

        this.pickupMessage.setText(message);
        this.pickupMessage.setVisible(true);

        this.tweens.killTweensOf(this.pickupMessage);

        this.pickupMessage.setAlpha(1);

        this.tweens.add({
            targets: this.pickupMessage,
            alpha: 0,
            duration: 1500,
            onComplete: () => {
                this.pickupMessage.setVisible(false);
                this.pickupMessage.setAlpha(1);
            }
        });
    }

    // ==========================================
    // 16. HEALTH UI
    // ==========================================

updateHealthUI() {
    if (!this.healthText || !this.healthBarBackground || !this.healthBarFill) {
        return;
    }

    const percentage = Phaser.Math.Clamp(
        this.health / this.maxHealth,
        0,
        1
    );

    this.healthText.setText(
        "HEALTH: " + this.health + " / " + this.maxHealth
    );

    // Health bar background
    this.healthBarBackground.clear();
    this.healthBarBackground.fillStyle(0x252b45, 1);
    this.healthBarBackground.fillRoundedRect(28, 82, 220, 9, 4);

    // Health bar fill
    this.healthBarFill.clear();

    let healthColor = 0x00ff88;

    if (percentage <= 0.25) {
        healthColor = 0xff304f;
    } else if (percentage <= 0.5) {
        healthColor = 0xffc857;
    }

    if (percentage > 0) {
        this.healthBarFill.fillStyle(healthColor, 1);
        this.healthBarFill.fillRoundedRect(
            28,
            82,
            220 * percentage,
            9,
            4
        );
    }
}


    // ==========================================
    // 17. CREATE PLAYER BULLET
    // ==========================================

    createPlayerBullet(x, y, angle = 0, damage = 1) {

        const bullet = this.add.container(x, y);

        const outer = this.add.ellipse(
            0, 0, 12, 28, 0xff4500
        );

        const inner = this.add.ellipse(
            0, 0, 5, 20, 0xffff00
        );

        bullet.add([outer, inner]);
        bullet.setDepth(10);

        bullet.velocityX = Math.sin(angle) * 8;
        bullet.velocityY = -Math.cos(angle) * 8;
        bullet.damage = damage;

        this.bullets.push(bullet);
    }

    // ==========================================
    // 18. HOMING MISSILES
    // ==========================================

    launchHomingMissiles(count) {

        for (let i = 0; i < count; i++) {

            const missile = this.add.container(
                this.ship.x + (i === 0 ? -15 : 15),
                this.ship.y - 25
            );

            const graphics = this.add.graphics();

            graphics.fillStyle(0xffcc00, 1);
            graphics.fillTriangle(0, -12, -6, 8, 6, 8);

            graphics.fillStyle(0xff5500, 1);
            graphics.fillCircle(0, 7, 3);

            missile.add(graphics);
            missile.setDepth(11);

            missile.damage = 8;
            missile.speed = 5;
            missile.life = 6000;

            this.missiles.push(missile);
        }
    }

    // ==========================================
    // 19. EMP BLAST
    // ==========================================

    activateEMP() {

        const radius = 230;

        const effect = this.add.circle(
            this.ship.x,
            this.ship.y,
            radius,
            0x00ffff,
            0.18
        );

        effect.setStrokeStyle(4, 0x00ffff, 1);
        effect.setDepth(15);

        this.tweens.add({
            targets: effect,
            scale: 1.5,
            alpha: 0,
            duration: 600,
            onComplete: () => effect.destroy()
        });

        this.enemies.forEach(enemy => {

            if (!enemy || !enemy.active) return;

            const distance = Phaser.Math.Distance.Between(
                this.ship.x,
                this.ship.y,
                enemy.x,
                enemy.y
            );

            if (distance <= radius) {
                enemy.health -= 5;

                if (enemy.health <= 0) {
                    this.destroyEnemy(enemy);
                }
            }
        });

        if (this.boss && this.boss.active) {

            const distance = Phaser.Math.Distance.Between(
                this.ship.x,
                this.ship.y,
                this.boss.x,
                this.boss.y
            );

            if (distance <= radius) {
                this.boss.health -= 20;

                if (this.boss.health <= 0) {
                    this.defeatBoss();
                } else {
                    this.updatebossHealthGraphics();
                }
            }
        }
    }
// ==========================================
// 20. ENEMY DESTRUCTION AND REWARDS
// ==========================================
destroyEnemy(enemy, killedByBullet = false) {

    if (!enemy || !enemy.active) return;

    // Count only player bullet kills toward wave completion
    if (killedByBullet) {
        this.waveKills++;
    } else if (
        this.waveActive &&
        this.waveNumber >= 1 &&
        this.waveNumber <= 4 &&
        this.waveKills < this.waveRequiredKills &&
        enemy.enemyType
    ) {
        // Require this enemy type to be destroyed by a bullet
        this.waveQueue.push(enemy.enemyType);
    }

    this.enemiesDefeated++;
    this.score += enemy.scoreValue;

    this.scoreText.setText("SCORE: " + this.score);

    const dropX = enemy.x;
    const dropY = enemy.y;

    enemy.destroy();

    // 45% chance of dropping a reward
    if (Math.random() < 0.45) {
        this.createPickup(dropX, dropY);
    }
}

    // ==========================================
    // 21. CREATE COMBAT PICKUP
    // ==========================================

    createPickup(x, y) {

        // Include all old pickups and all eight power-ups
        const types = [
            ...Object.keys(PICKUP_SETTINGS),
            ...Object.keys(POWERUP_SETTINGS)
        ];

        const type = Phaser.Utils.Array.GetRandom(types);

        const isPowerup = Object.prototype.hasOwnProperty.call(
            POWERUP_SETTINGS,
            type
        );

        const settings = isPowerup
            ? {
                color: {
                    shield: 0x00ffff,
                    rapidFire: 0xffcc00,
                    spreadShot: 0xff8800,
                    homing: 0xff00ff,
                    emp: 0x9933ff,
                    repair: 0x00ff66,
                    overdrive: 0xff3333,
                    warp: 0xffffff
                }[type]
            }
            : PICKUP_SETTINGS[type];

        const pickup = this.add.container(x, y);

        const circle = this.add.circle(
            0, 0, 13, settings.color
        );

        circle.setStrokeStyle(2, 0xffffff, 1);

        const symbols = {
            shield: "S",
            rapidFire: "R",
            spreadShot: "M",
            homing: "H",
            emp: "E",
            repair: "+",
            overdrive: "O",
            warp: "W"
        };

        const label = this.add.text(
            0, 0,
            isPowerup
                ? symbols[type]
                : type.substring(0, 1).toUpperCase(),
            {
                fontSize: "16px",
                color: "#000000",
                fontStyle: "bold"
            }
        ).setOrigin(0.5);

        pickup.add([circle, label]);
        pickup.setDepth(12);

        pickup.pickupType = type;
        pickup.expireAt = this.time.now + 10000;

        this.pickups.push(pickup);
    }


    // ==========================================
    // 22. COLLECT PICKUP
    // ==========================================

    collectPickup(pickup) {

        if (!pickup || !pickup.active) return;

        const type = pickup.pickupType;

        // Automatically activate any of the eight power-ups
        if (POWERUP_SETTINGS[type]) {
            this.activatePowerup(type, true);
        }

        // Preserve support for older pickup types
        else {
            switch (type) {

                case "credit":
                    this.creditsCollected += 10;
                    break;

                case "energy":
                    this.energyCollected += 1;
                    break;

                case "weapon":
                    this.weaponLevel = Math.min(
                        3,
                        this.weaponLevel + 1
                    );
                    break;
            }
        }

        pickup.destroy();
        
    }

    // ==========================================
    // 23. UPDATE PICKUPS
    // ==========================================

    updatePickups(movementFactor) {

        if (!this.pickups) return;

        this.pickups.forEach(pickup => {

            if (!pickup || !pickup.active) return;

            // Move pickup downwards
            pickup.y += 1.5 * movementFactor;

            // Remove expired or off-screen pickups
            if (
                this.time.now >= pickup.expireAt ||
                pickup.y > this.scale.height + 30
            ) {
                pickup.destroy();
                return;
            }

            // Detect spaceship collection
            const distance = Phaser.Math.Distance.Between(
                this.ship.x,
                this.ship.y,
                pickup.x,
                pickup.y
            );

            if (distance < 35) {
                this.collectPickup(pickup);
            }
        });

        // Remove inactive pickups
        this.pickups = this.pickups.filter(
            pickup => pickup && pickup.active
        );
    }

    // ==========================================
    // 24. PLAYER DAMAGE
    // ==========================================

    damagePlayer(amount) {

        if (this.gameOver || this.missionCompleted) return;

        const now = this.time.now;

        if (now < this.playerInvulnerableUntil) return;

        if (now < this.shieldActiveUntil) {
            this.showPickupMessage("SHIELD BLOCKED DAMAGE!");
            return;
        }

        if (
            now < this.powerups.shield.activeUntil
        ) {
            this.showPickupMessage("SHIELD BLOCKED DAMAGE!");
            return;
        }

       const reducedDamage = Math.ceil(
    amount * (1 - this.shipDamageReduction)
);

this.health -= reducedDamage;
this.damageTaken += reducedDamage;

this.playerInvulnerableUntil = now + 1000;

        if (this.health <= 0) {

            this.health = 0;
            this.gameOver = true;
            this.submitSessionResult("FAILED");

            this.gameOverText.setVisible(true);

            this.gameOverScore.setText(
                "Final Score: " + this.score
            );

            this.gameOverScore.setVisible(true);
            this.restartText.setVisible(true);
        }

        this.updateHealthUI();
    }

async submitSessionResult(result) {
    if (!this.sessionId || this.resultSubmitted || this.submittingResult) {
        return null;
    }

    this.submittingResult = true;

    try {
        const savedResult = await completeGameSession(
            this.sessionId,
            {
                score: this.score,
                enemiesDefeated: this.enemiesDefeated,
                bossesDefeated: this.bossesDefeated,
                damageTaken: this.damageTaken,
                result
            }
        );

        this.resultSubmitted = true;

        console.log("Mission result saved:", savedResult);

        // Refresh dashboard wallet after backend confirms the reward.
        window.dispatchEvent(new Event("walletUpdated"));

        return savedResult;

    } catch (error) {
        console.error("Unable to save mission result:", error);
        this.messageText.setText("REWARD SAVE FAILED - PLEASE TRY AGAIN");
        this.messageText.setVisible(true);
        return null;

    } finally {
        this.submittingResult = false;
    }
}

    // ==========================================
    // 25. RESET ENEMY LIST
    // ==========================================

    removeDestroyedEnemies() {

        this.enemies = this.enemies.filter(
            enemy => enemy && enemy.active
        );
    }

        // ==========================================
    // 26. START BOSS WAVE
    // ==========================================

   
startBossWave() {

    if (this.gameOver || this.missionCompleted) return;

    this.waveNumber = 5;
    this.waveActive = false;
    this.bossDefeated = false;

    this.waveText.setText("MISSION BOSS");

    // Show the boss warning
    this.messageText.setText("WARNING! BOSS APPROACHING!");
    this.messageText.setVisible(true);

    // Hide the warning after 2 seconds
    this.time.delayedCall(2000, () => {
        if (!this.gameOver && !this.missionCompleted) {
            this.messageText.setVisible(false);
        }
    });

    // Create the boss
    this.createBoss();
}

    // ==========================================
    // 27. CREATE BOSS
    // ==========================================

    createBoss() {

        const bossIndex = (this.missionNumber - 1) % BOSS_LIST.length;
        const settings = BOSS_LIST[bossIndex];

        const difficulty = 1 + (this.missionNumber - 1) * 0.15;

        const boss = this.add.container(450, 130);

        const graphics = this.add.graphics();

// ==========================================
// NEW BOSS SPACESHIP DESIGN
// ==========================================

// Rear engine glow
graphics.fillStyle(0xff6600, 1);
graphics.fillTriangle(-35, -35, -15, -35, -25, -65);
graphics.fillTriangle(15, -35, 35, -35, 25, -65);

// Large angular wings
graphics.fillStyle(settings.wingColor || 0x552299, 1);

graphics.fillTriangle(
    -35, -15,
    -105, -55,
    -85, 45
);

graphics.fillTriangle(
    35, -15,
    105, -55,
    85, 45
);

// Wing armor details
graphics.fillStyle(settings.color || 0xff0000, 1);

graphics.fillTriangle(
    -38, -5,
    -82, -35,
    -65, 25
);

graphics.fillTriangle(
    38, -5,
    82, -35,
    65, 25
);

// Main armored body
graphics.fillStyle(settings.color || 0xff0000, 1);
graphics.fillRoundedRect(-48, -48, 96, 100, 15);

// Front pointed section
graphics.fillStyle(0xcccccc, 1);
graphics.fillTriangle(
    -30, 20,
    30, 20,
    0, 68
);

// Side cannons
graphics.fillStyle(0x333344, 1);
graphics.fillRoundedRect(-65, -12, 18, 48, 5);
graphics.fillRoundedRect(47, -12, 18, 48, 5);

// Cannon energy lights
graphics.fillStyle(0xff5500, 1);
graphics.fillCircle(-56, 38, 7);
graphics.fillCircle(56, 38, 7);

// Central energy core
graphics.fillStyle(0x00ffff, 1);
graphics.fillCircle(0, -5, 23);

graphics.fillStyle(0xffffff, 1);
graphics.fillCircle(0, -5, 12);

// Armor border
graphics.lineStyle(4, 0xffffff, 1);
graphics.strokeRoundedRect(-48, -48, 96, 100, 15);

// Glowing wing details
graphics.fillStyle(0xffff00, 1);
graphics.fillCircle(-75, -15, 5);
graphics.fillCircle(75, -15, 5);

graphics.setDepth(8);
        

        boss.add(graphics);
        boss.setDepth(8);

        boss.health = Math.round(settings.health * difficulty);
        boss.maxHealth = boss.health;
        boss.damage = settings.damage;
        boss.speed = settings.speed;
        boss.pattern = settings.pattern;
        boss.direction = 1;
        boss.phase = 1;
        boss.hitCooldown = 0;
        boss.bossName = settings.name;

        // Slower movement and first bomb timer
boss.moveTime = 0;
boss.nextBombAt = this.time.now + 1800;

        this.boss = boss;

        this.bossNameText.setText(settings.name);
        this.bossNameText.setVisible(true);

        this.bossHealthGraphics.setVisible(true);
        this.updatebossHealthGraphics();

        this.showPickupMessage(settings.name + " HAS ARRIVED!");
    }

    // ==========================================
    // 28. UPDATE BOSS HEALTH BAR
    // ==========================================

    updatebossHealthGraphics() {

        if (!this.boss || !this.boss.active) return;

        const percentage = Phaser.Math.Clamp(
            this.boss.health / this.boss.maxHealth,
            0,
            1
        );

        this.bossHealthGraphics.clear();

        this.bossHealthGraphics.fillStyle(0x333333, 1);
        this.bossHealthGraphics.fillRoundedRect(
            250, 75, 400, 18, 5
        );

        this.bossHealthGraphics.fillStyle(0xff2222, 1);
        this.bossHealthGraphics.fillRoundedRect(
            250, 75, 400 * percentage, 18, 5
        );

        this.bossHealthGraphics.lineStyle(2, 0xffffff, 1);
        this.bossHealthGraphics.strokeRoundedRect(
            250, 75, 400, 18, 5
        );
    }

    // ==========================================
    // 29. UPDATE BOSS MOVEMENT
    // ==========================================

updateBoss(delta) {

    if (!this.boss || !this.boss.active) return;

    const boss = this.boss;
    const movement = delta / 16.67;

    // Slow down the boss movement animation
    boss.moveTime += delta * 0.45;

    const healthPercentage =
        boss.health / boss.maxHealth;

    if (healthPercentage <= 0.35) {
        boss.phase = 3;
    } else if (healthPercentage <= 0.70) {
        boss.phase = 2;
    } else {
        boss.phase = 1;
    }

    // Keep movement slower in every phase
    const phaseSpeed = boss.speed *
        (boss.phase === 1 ? 0.45 :
         boss.phase === 2 ? 0.55 : 0.65);

    switch (boss.pattern) {

        case "sweep":
            boss.x += boss.direction * phaseSpeed * movement;

            if (boss.x >= 780 || boss.x <= 120) {
                boss.direction *= -1;
            }

            boss.y = 125 + Math.sin(boss.moveTime / 500) * 35;
            break;

        case "serpent":
            boss.x = 450 + Math.sin(boss.moveTime / 350) * 280;
            boss.y = 130 + Math.sin(boss.moveTime / 200) * 30;
            break;

        case "orbit":
            boss.x = 450 + Math.cos(boss.moveTime / 650) * 250;
            boss.y = 140 + Math.sin(boss.moveTime / 650) * 45;
            break;

        case "zigzag":
            boss.x = 450 + Math.sin(boss.moveTime / 250) * 300;
            boss.y = 120 + Math.cos(boss.moveTime / 350) * 55;
            break;

        case "emperor":
            boss.x = 450 + Math.sin(boss.moveTime / 400) * 260;
            boss.y = 130 + Math.sin(boss.moveTime / 600) * 45;
            break;

        default:
            boss.x += boss.direction * phaseSpeed * movement;

            if (boss.x >= 780 || boss.x <= 120) {
                boss.direction *= -1;
            }
    }

    // Boss collision with player
    const distance = Phaser.Math.Distance.Between(
        boss.x,
        boss.y,
        this.ship.x,
        this.ship.y
    );

    if (distance < 75 && this.time.now >= boss.hitCooldown) {

        this.damagePlayer(boss.damage);
        boss.hitCooldown = this.time.now + 1000;
    }

    // Drop a bomb every 1.8 seconds
    if (this.time.now >= boss.nextBombAt) {

        this.createBossBomb();

        boss.nextBombAt = this.time.now + 1800;
    }
}



createBossBomb() {

    if (!this.boss || !this.boss.active) return;

    // Create a visible falling bomb
    const bomb = this.add.circle(
        this.boss.x,
        this.boss.y + 35,
        13,
        0xff5500
    );

    bomb.setStrokeStyle(3, 0xffff00);
    bomb.setDepth(10);

    bomb.damage = 30;

    this.bossBombs.push(bomb);
}


// ==========================================
// UPDATE BOSS BOMBS
// ==========================================

updateBossBombs(delta) {

    const movement = delta / 16.67;

    this.bossBombs.forEach(bomb => {

        if (!bomb || !bomb.active) return;

        // Bomb falls straight down
        bomb.y += 4.5 * movement;

        // Check collision with the player's spaceship
        const distance = Phaser.Math.Distance.Between(
            bomb.x,
            bomb.y,
            this.ship.x,
            this.ship.y
        );

        if (distance < 30) {

            this.damagePlayer(30);
            bomb.destroy();
            return;
        }

        // Remove bombs after they leave the screen
        if (bomb.y > 650) {
            bomb.destroy();
        }
    });

    // Keep only active bombs
    this.bossBombs = this.bossBombs.filter(
        bomb => bomb && bomb.active
    );
}


    // ==========================================
    // 30. BOSS DEFEAT
    // ==========================================

    defeatBoss() {

        if (!this.boss || this.bossDefeated) return;

        this.bossDefeated = true;
        this.bossesDefeated++;

        this.score += 5000;
        this.scoreText.setText("SCORE: " + this.score);

        const explosion = this.add.circle(
            this.boss.x,
            this.boss.y,
            50,
            0xffaa00,
            0.9
        );

        this.tweens.add({
            targets: explosion,
            scale: 3,
            alpha: 0,
            duration: 700,
            onComplete: () => explosion.destroy()
        });

        this.boss.destroy();
        this.boss = null;

        this.bossBombs = [];

        this.bossNameText.setVisible(false);
        this.bossHealthGraphics.setVisible(false);

        this.completeMission();// Remove remaining boss bombs
this.bossBombs.forEach(bomb => {
    if (bomb && bomb.active) {
        bomb.destroy();
    }
});

this.bossBombs = [];
    }

    // ==========================================
    // 31. COMPLETE MISSION
    // ==========================================

 
async completeMission() {

    if (this.missionCompleted || this.gameOver) return;

    this.missionCompleted = true;

    this.messageText.setText("MISSION COMPLETED - SAVING REWARDS...");
    this.messageText.setVisible(true);

    const savedResult = await this.submitSessionResult("COMPLETED");

    if (!savedResult) {
        this.missionCompleted = false;
        this.messageText.setText("REWARD SAVE FAILED - TRY AGAIN");
        return;
    }

    const sectorNumber = Math.ceil(this.missionNumber / 10);

    const missionWithinSector =
        ((this.missionNumber - 1) % 10) + 1;

    const missionId =
        `sector-${sectorNumber}-mission-${String(missionWithinSector).padStart(2, "0")}`;

    try {
        await saveCompletedMission(missionId, {
            score: this.score,
            stars: 1
        });
    } catch (error) {
        console.error("Mission progress saving failed:", error);
    }
        window.dispatchEvent(new Event("missionProgressUpdated"));

    this.messageText.setVisible(false);

    this.completedText.setText(
        "MISSION " + this.missionNumber + " COMPLETED!"
    );

    this.completedText.setVisible(true);

    this.completedScoreText.setText(
        "Score: " + this.score +
        "\nStars: 1 / 3" +
        "\nCredits collected: " + this.creditsCollected +
        "\nEnergy collected: " + this.energyCollected
    );

    this.completedScoreText.setVisible(true);
    this.nextMissionText.setText("NEXT MISSION");
    this.nextMissionText.setVisible(true);
    this.playAgainText.setVisible(true);
}


togglePause() {

    if (this.gameOver || this.missionCompleted) return;

    this.isPaused = !this.isPaused;

    this.pauseOverlay.setVisible(this.isPaused);
    this.pausedTitle.setVisible(this.isPaused);
    this.resumeText.setVisible(this.isPaused);

    this.pauseText.setVisible(!this.isPaused);

    if (this.isPaused) {
        this.time.paused = true;
        this.tweens.pauseAll();

        if (this.physics && this.physics.world) {
            this.physics.world.pause();
        }
    } else {
        this.time.paused = false;
        this.tweens.resumeAll();

        if (this.physics && this.physics.world) {
            this.physics.world.resume();
        }
    }
}


    // ==========================================
    // 32. FIRE PLAYER WEAPON
    // ==========================================

    firePlayerWeapon() {

        const now = this.time.now;

        const rapidActive =
            now < this.powerups.rapidFire.activeUntil;

        const overdriveActive =
            now < this.powerups.overdrive.activeUntil;

        let interval = 120;

        if (rapidActive) interval = 60;
        if (overdriveActive) interval = Math.min(interval, 80);

        if (now - this.lastPlayerShot < interval) return;

        this.lastPlayerShot = now;

        const damage = this.shipDamage * (overdriveActive ? 2 : 1);

        if (now < this.powerups.spreadShot.activeUntil) {

            this.createPlayerBullet(
                this.ship.x,
                this.ship.y - 25,
                -0.25,
                damage
            );

            this.createPlayerBullet(
                this.ship.x,
                this.ship.y - 25,
                0,
                damage
            );

            this.createPlayerBullet(
                this.ship.x,
                this.ship.y - 25,
                0.25,
                damage
            );

        } else if (this.weaponLevel >= 3) {

            this.createPlayerBullet(
                this.ship.x - 12,
                this.ship.y - 25,
                0,
                damage
            );

            this.createPlayerBullet(
                this.ship.x + 12,
                this.ship.y - 25,
                0,
                damage
            );

        } else {

            this.createPlayerBullet(
                this.ship.x,
                this.ship.y - 25,
                0,
                damage
            );
        }
    }

    // ==========================================
    // 33. UPDATE PLAYER MOVEMENT
    // ==========================================
updatePlayerMovement(delta) {

    if (!this.movementKeys || !this.ship) return;

    const keys = this.movementKeys;

    const speed = this.shipMovementSpeed * (delta / 16.67);

    if (keys.left.isDown || keys.arrowLeft.isDown) {
        this.ship.x -= speed;
    }

    if (keys.right.isDown || keys.arrowRight.isDown) {
        this.ship.x += speed;
    }

    if (keys.up.isDown || keys.arrowUp.isDown) {
        this.ship.y -= speed;
    }

    if (keys.down.isDown || keys.arrowDown.isDown) {
        this.ship.y += speed;
    }

    this.ship.x = Phaser.Math.Clamp(this.ship.x, 35, 865);
    this.ship.y = Phaser.Math.Clamp(this.ship.y, 300, 570);
}
    
    // ==========================================
    // 35. UPDATE PLAYER BULLETS
    // ==========================================

    updateBullets(movementFactor) {

        this.bullets.forEach(bullet => {

            if (!bullet || !bullet.active) return;

            bullet.x += bullet.velocityX * movementFactor;
            bullet.y += bullet.velocityY * movementFactor;

            if (
                bullet.y < -30 ||
                bullet.x < -30 ||
                bullet.x > 930
            ) {
                bullet.destroy();
                return;
            }

            // Collision with normal enemies
            for (const enemy of this.enemies) {

                if (!enemy || !enemy.active) continue;

                const distance = Phaser.Math.Distance.Between(
                    bullet.x,
                    bullet.y,
                    enemy.x,
                    enemy.y
                );

                if (distance < 30 * (enemy.scaleX || 1)) {

                    enemy.health -= bullet.damage;

                    bullet.destroy();

                   if (enemy.health <= 0) {
    this.destroyEnemy(enemy, true);
}

                    break;
                }
            }

            // Collision with boss
            if (
                bullet.active &&
                this.boss &&
                this.boss.active
            ) {

                const distance = Phaser.Math.Distance.Between(
                    bullet.x,
                    bullet.y,
                    this.boss.x,
                    this.boss.y
                );

                if (distance < 75) {

                    this.boss.health -= bullet.damage;

                    bullet.destroy();

                    if (this.boss.health <= 0) {
                        this.defeatBoss();
                    } else {
                        this.updatebossHealthGraphics();
                    }
                }
            }
        });

        this.bullets = this.bullets.filter(

            bullet => bullet && bullet.active
        );
    }

    

    // ==========================================
    // 36. UPDATE HOMING MISSILES
    // ==========================================

    updateMissiles(delta) {

        this.missiles.forEach(missile => {

            if (!missile || !missile.active) return;

            missile.life -= delta;

            if (missile.life <= 0) {
                missile.destroy();
                return;
            }


            let target = null;
            let shortestDistance = Infinity;

            // Find nearest enemy
            this.enemies.forEach(enemy => {

                if (!enemy || !enemy.active) return;

                const distance = Phaser.Math.Distance.Between(
                    missile.x,
                    missile.y,
                    enemy.x,
                    enemy.y
                );

                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    target = enemy;
                }
            });

            // Target boss if no normal enemy is available
            if (
                !target &&
                this.boss &&
                this.boss.active
            ) {
                target = this.boss;
            }

            if (target) {

                const angle = Phaser.Math.Angle.Between(
                    missile.x,
                    missile.y,
                    target.x,
                    target.y
                );

                const speed = missile.speed;

                missile.x += Math.cos(angle) * speed;
                missile.y += Math.sin(angle) * speed;

                missile.rotation = angle + Math.PI / 2;

                const distance = Phaser.Math.Distance.Between(
                    missile.x,
                    missile.y,
                    target.x,
                    target.y
                );

                if (distance < 35) {

                    if (target === this.boss) {

                        this.boss.health -= missile.damage;

                        if (this.boss.health <= 0) {
                            this.defeatBoss();
                        } else {
                            this.updatebossHealthGraphics();
                        }

                    } else {

                        target.health -= missile.damage;

                        if (target.health <= 0) {
                            this.destroyEnemy(target);
                        }
                    }

                    missile.destroy();
                }

            } else {

                missile.y -= missile.speed;
            }
        });

        this.missiles = this.missiles.filter(
            missile => missile && missile.active
        );
    }

    
    // ==========================================
    // 37. MAIN GAME UPDATE LOOP
    // ==========================================

    update(time, delta) {

        if (this.gameOver || this.missionCompleted || this.isPaused) return;

        const movementFactor = delta / 16.67;

        
        // Move background stars safely
        if (this.stars) {

            let starObjects = [];

            if (Array.isArray(this.stars)) {
                starObjects = this.stars;
            } else if (typeof this.stars.getChildren === "function") {
                starObjects = this.stars.getChildren();
            } else if (this.stars.children?.entries) {
                starObjects = this.stars.children.entries;
            }

            starObjects.forEach(star => {

                if (!star || !star.active) return;

                star.y += 1.5 * movementFactor;

                if (star.y > 620) {
                    star.y = -10;
                    star.x = Phaser.Math.Between(0, 900);
                }
            });
        }

        // Player movement
        this.updatePlayerMovement(delta);

        

        // Keep shield visual attached to player
        if (this.shieldGraphic) {

            const shieldActive =
                this.time.now < this.shieldActiveUntil ||
                this.time.now < this.powerups.shield.activeUntil;

            this.shieldGraphic.setPosition(
                this.ship.x,
                this.ship.y
            );

            this.shieldGraphic.setVisible(shieldActive);
        }
// ==========================================
// PLAYER SHOOTING - KEYBOARD + MOBILE
// ==========================================

const keyboardFire = this.input.keyboard.checkDown(
    this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.SPACE
    ),
    1
);

// PC: Shoot using SPACE
// MOBILE: Shoot automatically while touching the screen
if (keyboardFire || this.touchFireActive) {
    this.firePlayerWeapon();
}

// Update bullets and missiles
this.updateBullets(movementFactor);
this.updateMissiles(delta);
        // ==========================================
        // UPDATE ENEMY MOVEMENT AND COLLISION
        // ==========================================

        this.enemies.forEach(enemy => {

            // Skip enemies that are already destroyed
            if (!enemy || !enemy.active) return;

            // Move the enemy using its horizontal and vertical velocity
            enemy.x += enemy.velocityX * movementFactor;
            enemy.y += enemy.velocityY * movementFactor;

           // ------------------------------------------
// KEEP ENEMIES INSIDE THE GAME SCREEN
// ------------------------------------------

// Left boundary
if (enemy.x <= 35 && enemy.velocityX < 0) {
    enemy.x = 35;
    enemy.velocityX *= -1;
}

// Right boundary
else if (enemy.x >= 865 && enemy.velocityX > 0) {
    enemy.x = 865;
    enemy.velocityX *= -1;
}

// Top boundary
if (enemy.y <= 35 && enemy.velocityY < 0) {
    enemy.y = 35;
    enemy.velocityY *= -1;
}

// Bottom boundary
else if (enemy.y >= 605 && enemy.velocityY > 0) {
    enemy.y = 605;
    enemy.velocityY *= -1;
}

            // ------------------------------------------
            // ROTATE ENEMY TOWARDS ITS MOVEMENT DIRECTION
            // ------------------------------------------

            const movementAngle = Math.atan2(
                enemy.velocityY,
                enemy.velocityX
            );

            // Enemy spaceship artwork points downward by default
            enemy.rotation = movementAngle - Math.PI / 2;

            // ------------------------------------------
            // ENEMY COLLISION WITH PLAYER
            // ------------------------------------------

            const distance = Phaser.Math.Distance.Between(
                this.ship.x,
                this.ship.y,
                enemy.x,
                enemy.y
            );

            if (distance < 35 * (enemy.scaleX || 1)) {
    this.damagePlayer(enemy.damage);

    if (
        this.waveActive &&
        this.waveNumber >= 1 &&
        this.waveNumber <= 4 &&
        this.waveKills < this.waveRequiredKills &&
        enemy.enemyType
    ) {
        this.waveQueue.push(enemy.enemyType);
    }

    enemy.destroy();
}
        });

// Remove only enemies actually destroyed by player attacks
this.removeDestroyedEnemies();

// Update pickups
this.updatePickups(movementFactor);

// Update boss
this.updateBoss(delta);

// Update falling boss bombs
this.updateBossBombs(delta);


        // ==========================================
        // SPAWN ENEMIES AND PROGRESS THROUGH WAVES
        // ==========================================

        if (this.waveActive && !this.boss) {

            // Spawn the next enemy when its timer allows
            this.spawnNextEnemy(time);

            // A wave is finished only when:
            // 1. All enemies have been spawned
            // 2. All active enemies have been destroyed
            if (
    this.waveQueue.length === 0 &&
    this.enemies.length === 0 &&
    this.waveKills >= this.waveRequiredKills
) {

                // Start the wave-completion countdown
                if (this.waveCompleteAt === null) {

                    this.waveCompleteAt = time + 1500;

                    this.messageText.setText("WAVE COMPLETE!");
                    this.messageText.setVisible(true);
                }

                // Move to the next wave after the countdown
                else if (time >= this.waveCompleteAt) {

                    this.waveCompleteAt = null;

                    // Stop the current wave
                    this.waveActive = false;

                    // Hide the completion message
                    this.messageText.setVisible(false);

                    // Start the next wave.
                    // After Wave 4, startWave(5) starts the boss.
                    this.startWave(this.waveNumber + 1);
                }

            } else {

                // Reset the completion timer while enemies remain
                this.waveCompleteAt = null;
            }
        }

        // Update power-up inventory and cooldown display
        this.updatePowerupUI();
    }
}

export default SpaceScene;