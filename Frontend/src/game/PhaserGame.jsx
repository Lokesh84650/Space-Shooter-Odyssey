
import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import SpaceScene from "./SpaceScene";

function PhaserGame({
    selectedShip = "Interceptor",
    selectedMission = null,
    sessionId = null
}) {
    const gameRef = useRef(null);

    useEffect(() => {
        if (!sessionId || !gameRef.current) {
            return;
        }

        const config = {
            type: Phaser.AUTO,
            width: 900,
            height: 600,
            parent: gameRef.current,
            backgroundColor: "#08091F",

            // Responsive scaling for desktop, tablet and mobile
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH
            },

            scene: [SpaceScene]
        };

        const game = new Phaser.Game(config);

        game.events.once(Phaser.Core.Events.READY, () => {
            game.scene.start("SpaceScene", {
                selectedShip,
                selectedMission,
                sessionId
            });
        });

        return () => {
            game.destroy(true);
        };
    }, [selectedShip, selectedMission, sessionId]);

    return (
        <div className="phaser-game-container">
            <div ref={gameRef}></div>
        </div>
    );
}

export default PhaserGame;
