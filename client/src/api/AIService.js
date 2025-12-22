import axios from "axios";

// In production, prefer SAME-ORIGIN calls (no domain), so it works on Render without CORS pain.
const BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";

const AIService = {
    getAIRecommendation: async (inputData) => {
        try {
            // If BASE="", this becomes "/api/v1/ai/predict" (same domain)
            const url = `${BASE}/api/v1/ai/predict`;
            const res = await axios.post(url, inputData, {
                headers: { "Content-Type": "application/json" },
            });
            return res.data;
        } catch (err) {
            console.error("AI Recommendation API error:", {
                message: err?.message,
                code: err?.code,
                url: err?.config?.url,
                status: err?.response?.status,
                data: err?.response?.data,
            });
            throw err;
        }
    },
};

export default AIService;