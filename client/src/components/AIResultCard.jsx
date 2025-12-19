import React from "react";

const AIResultCard = ({ recommendation }) => {
    if (!recommendation) return null;

    return (
        <div className="ai-result-card" style={styles.card}>
            <h3>Recommended PC</h3>
            {Object.entries(recommendation).map(([key, value]) => (
                <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
                </p>
            ))}
        </div>
    );
};

const styles = {
    card: {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        maxWidth: "400px",
        margin: "20px auto",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },
};

export default AIResultCard;