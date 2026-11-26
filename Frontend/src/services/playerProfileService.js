
const API_URL = "https://astonishing-forgiveness-production-d96626dc.up.railway.app/api/player/profile";

export const getPlayerProfile = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Please log in to view your profile.");
    }

    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (response.status === 401 || response.status === 403) {
        throw new Error("Your login session is invalid. Please log in again.");
    }

    if (!response.ok) {
        throw new Error("Unable to load player profile.");
    }

    return await response.json();
};
