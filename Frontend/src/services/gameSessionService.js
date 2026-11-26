
const API_URL = "https://astonishing-forgiveness-production-d96626dc.up.railway.app/api/game-sessions";

function getAuthHeaders() {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Please log in before starting a mission.");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
}

// Start a new game session
export async function startGameSession(missionId, selectedShipId) {
    const response = await fetch(`${API_URL}/start`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
            missionId,
            selectedShipId
        })
    });

    if (!response.ok) {
        throw new Error("Unable to start game session.");
    }

    return await response.json();
}

// Save mission completion results
export async function completeGameSession(sessionId, results) {
    const response = await fetch(
        `${API_URL}/${sessionId}/complete`,
        {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                score: results.score,
                enemiesDefeated: results.enemiesDefeated,
                bossesDefeated: results.bossesDefeated,
                damageTaken: results.damageTaken,
                result: results.result
            })
        }
    );

    if (!response.ok) {
        throw new Error("Unable to save mission results.");
    }

    return await response.json();
}
