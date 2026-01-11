import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import './AddHabitModal.css';

const EMOJI_PRESETS = ['💧', '🏃', '📚', '🧘', '🍎', '💻', '🎸', '🎨', '💤', '💰', '📈'];

const AddHabitModal = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(EMOJI_PRESETS[0]);
    const [reminderTime, setReminderTime] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        onAdd({
            name,
            icon: selectedIcon,
            reminderTime
        });

        // Reset and close
        setName('');
        setReminderTime('');
        setSelectedIcon(EMOJI_PRESETS[0]);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2><Sparkles size={20} className="text-purple" /> New Quest</h2>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Quest Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Read 10 Pages"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label>Daily Reminder (Optional)</label>
                        <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="time-input"
                        />
                    </div>

                    <div className="form-group">
                        <label>Choose Icon</label>
                        <div className="emoji-grid">
                            {EMOJI_PRESETS.map(emoji => (
                                <button
                                    type="button"
                                    key={emoji}
                                    className={`emoji-btn ${selectedIcon === emoji ? 'selected' : ''}`}
                                    onClick={() => setSelectedIcon(emoji)}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button type="submit" className="btn submit-btn" disabled={!name.trim()}>
                        Start Quest
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddHabitModal;
