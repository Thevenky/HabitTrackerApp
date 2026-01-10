import React from 'react';
import './ProgressRing.css';

const ProgressRing = ({ radius, stroke, progress, total }) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="progress-ring-container">
            <div className="progress-ring-text">
                <span className="progress-percentage">{Math.round(progress)}%</span>
                <span className="progress-label">Daily Goal</span>
            </div>
            <svg
                height={radius * 2}
                width={radius * 2}
                className="progress-ring-svg"
            >
                {/* Background Circle */}
                <circle
                    stroke="var(--color-bg-card-hover)"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress Circle */}
                <circle
                    stroke="url(#gradient)"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className="progress-ring-circle"
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default ProgressRing;
