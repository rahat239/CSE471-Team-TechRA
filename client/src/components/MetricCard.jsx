// frontend/src/components/MetricCard.jsx
import React from 'react';

const MetricCard = ({ title, value, subtitle, icon = 'bi-bar-chart', accent = 'accent-purple' }) => {
    return (
        <div className={`card metric-card ${accent}`}>
            <div className="card-body d-flex align-items-center">
                <div className="metric-icon me-3">
                    <i className={`bi ${icon}`} />
                </div>
                <div className="flex-grow-1">
                    <div className="metric-title">{title}</div>
                    <div className="metric-value">{value}</div>
                    {subtitle && <div className="metric-sub">{subtitle}</div>}
                </div>
            </div>
        </div>
    );
};

export default MetricCard;
