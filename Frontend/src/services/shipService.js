
const API_URL = "https://astonishing-forgiveness-production-d96626dc.up.railway.app/api/ships";

const getHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Please log in again.");
    }

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 || response.status === 403) {
        throw new Error("Your login session is invalid. Please log out and log in again.");
    }

    if (!response.ok) {
        throw new Error(
            data.message || data.error || `Ship request failed: HTTP ${response.status}`
        );
    }

    return data;
};

export const getShips = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: getHeaders()
    });

    return handleResponse(response);
};

export const purchaseShip = async (shipId) => {
    const response = await fetch(`${API_URL}/${shipId}/purchase`, {
        method: "POST",
        headers: getHeaders()
    });

    return handleResponse(response);
};

export const selectShip = async (shipId) => {
    const response = await fetch(`${API_URL}/${shipId}/select`, {
        method: "POST",
        headers: getHeaders()
    });

    return handleResponse(response);
};

export const upgradeShip = async (shipId, upgradeType) => {
    const response = await fetch(`${API_URL}/${shipId}/upgrade`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ upgradeType })
    });

    return handleResponse(response);
};
