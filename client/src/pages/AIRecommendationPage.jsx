import React, { useState } from "react";
import AIResultCard from "../components/AIResultCard";
import AIService from "../api/AIService";

const AIRecommendationPage = () => {
    const [budget, setBudget] = useState("");
    const [workPurpose, setWorkPurpose] = useState("");
    const [recommendations, setRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setRecommendations(null);

        try {
            const data = {
                budget: parseFloat(budget),
                work_purpose: workPurpose,
            };

            const response = await AIService.getAIRecommendation(data);

            if (response) {
                setRecommendations(response);
            } else {
                setError("No recommendations available. Try different inputs.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to get recommendations. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderPCList = (title, pcs) => (
        <div style={{ marginTop: "30px" }}>
            <h3 style={{ color: "#ffcc00" }}>{title}</h3>
            {pcs.map((pc, idx) => (
                <div
                    key={idx}
                    style={{
                        background: "#222",
                        padding: "15px",
                        borderRadius: "10px",
                        marginBottom: "10px",
                        textAlign: "left",
                    }}
                >
                    <strong>PC:</strong> {pc.pc} <br />
                    <strong>Brand:</strong> {pc.brand} <br />
                    <strong>CPU:</strong> {pc.CPU} <br />
                    <strong>GPU:</strong> {pc.GPU} <br />
                    <strong>RAM:</strong> {pc.RAM} <br />
                    <strong>Storage:</strong> {pc.Storage} <br />
                    <strong>Price:</strong> {pc.price.toLocaleString()} BDT
                </div>
            ))}
        </div>
    );

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>AI PC Recommendation</h1>
            <h2 style={styles.subheading}>Find the Perfect PC for Your Needs</h2>

            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type="number"
                    placeholder="Budget (BDT)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    min={1000}
                    required
                    style={styles.input}
                />

                <select
                    value={workPurpose}
                    onChange={(e) => setWorkPurpose(e.target.value)}
                    required
                    style={styles.input}
                >
                    <option value="">Select Work Purpose</option>
                    <option value="gaming">Gaming</option>
                    <option value="development">Development</option>
                    <option value="graphics">Graphics</option>
                    <option value="office">Office</option>
                    <option value="video_editing">Video Editing</option>
                </select>

                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? "Getting Recommendations..." : "Get Recommendations"}
                </button>
            </form>

            {error && <p style={styles.error}>{error}</p>}

            {recommendations && (
                <div style={{ width: "80%", maxWidth: "600px", marginTop: "40px" }}>
                    {/* Top Pick */}
                    {renderPCList(" AI Top Pick", [recommendations.top_pick])}

                    {/* Similar Budget */}
                    {recommendations.similar_budget &&
                        recommendations.similar_budget.length > 0 &&
                        renderPCList(" Similar Budget PCs", recommendations.similar_budget)}

                    {/* Higher Budget Options */}
                    {recommendations.higher_budget &&
                        recommendations.higher_budget.length > 0 &&
                        renderPCList("⬆️ If You Increase Budget", recommendations.higher_budget)}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "radial-gradient(circle, rgba(34,34,34,1), rgba(50,50,80,1))",
        color: "#fff",
        fontFamily: "'Poppins', sans-serif",
        padding: "20px",
        textAlign: "center",
    },
    heading: {
        fontSize: "3rem",
        marginBottom: "10px",
        color: "#c0c0c0",
        fontWeight: "bold",
        letterSpacing: "2px",
    },
    subheading: {
        fontSize: "1.4rem",
        marginBottom: "30px",
        color: "#fff",
        fontStyle: "italic",
        fontWeight: "lighter",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        width: "100%",
        maxWidth: "400px",
    },
    input: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "2px solid #444",
        background: "#333",
        color: "#fff",
        outline: "none",
    },
    button: {
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        background: "linear-gradient(45deg, #8a2be2, #007bff)",
        color: "#fff",
        cursor: "pointer",
        transition: "0.3s ease",
    },
    error: {
        color: "red",
        marginTop: "20px",
    },
};

export default AIRecommendationPage;