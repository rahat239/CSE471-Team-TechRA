import axios from "axios";

const API_URL = "http://localhost:5030/api/v1/ai"; // removed trailing slash

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