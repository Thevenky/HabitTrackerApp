import React from 'react';
import { Check, Flame, Trash2 } from 'lucide-react';
import './HabitCard.css';

const HabitCard = ({ habit, onToggle, onDelete }) => {
    return (
        <div className={`habit-card ${habit.completed ? 'completed' : ''}`}>
            <div className="habit-icon-wrapper">
                <span className="habit-icon">{habit.icon}</span>
            </div>

            <div className="habit-info">
                <h3 className="habit-name">{habit.name}</h3>
                <div className="habit-streak">
                    <Flame size={14} className={habit.streak > 0 ? 'text-orange-500' : 'text-gray-500'} />
                    <span>{habit.streak} day streak</span>
                </div>
            </div>

            <div className="habit-actions">
                <button
                    className="habit-delete-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(habit.id);
                    }}
                    title="Delete Quest"
                >
                    <Trash2 size={18} />
                </button>
                <button
                    className={`habit-checkbox ${habit.completed ? 'checked' : ''}`}
                    onClick={() => onToggle(habit.id)}
                >
                    {habit.completed && <Check size={20} />}
                </button>
            </div>
        </div>
    );
};

export default HabitCard;
