
const API_URL = "https://astonishing-forgiveness-production-d96626dc.up.railway.app/api/wallet";

const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Please log in to continue.");
    }

    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

const handleResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
        throw new Error("Your login session is invalid. Please log in again.");
    }

    if (!response.ok) {
        throw new Error("Unable to complete wallet request.");
    }

    return await response.json();
};

// Get wallet balance
export const getWallet = async () => {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

// Get wallet transaction history
export const getWalletHistory = async () => {
    const response = await fetch(`${API_URL}/history`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

// Get daily reward status
export const getDailyRewardStatus = async () => {
    const response = await fetch(`${API_URL}/daily-reward/status`, {
        method: "GET",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};

// Claim daily login reward
export const claimDailyReward = async () => {
    const response = await fetch(`${API_URL}/daily-reward`, {
        method: "POST",
        headers: getAuthHeaders()
    });

    return handleResponse(response);
};
