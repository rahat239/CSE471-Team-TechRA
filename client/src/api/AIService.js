import axios from "axios";

// Use env variable if available, otherwise fallback to localhost (DEV)
const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5030";

const API_URL = `${API_BASE_URL}/api/v1/ai`;

const AIService = {
    getAIRecommendation: async (inputData) => {
        try {
            const response = await axios.post(
                `${API_URL}/predict`,
                inputData,
                {
                    timeout: 60000, // handle Render cold start
                }
            );
            return response.data;
        } catch (error) {
            console.error("AI Recommendation API error:", {
                message: error.message,
                code: error.code,
                url: `${API_URL}/predict`,
            });
            throw error;
        }
    },
};

export default AIService;