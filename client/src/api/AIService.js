import axios from "axios";

// Dynamically set the API URL based on the environment
const API_URL = window.location.hostname === "localhost"
    ? "http://localhost:5030/api/v1/ai"  // Local development URL
    : "https://cse471-team-techra-6-08.onrender.com/api/v1/ai";  // Production URL (Render)

const AIService = {
    getAIRecommendation: async (inputData) => {
        try {
            const response = await axios.post(`${API_URL}/predict`, inputData);
            return response.data;
        } catch (error) {
            console.error("AI Recommendation API error:", error);
            throw error;
        }
    },
};

export default AIService;