import React, { useState, useEffect } from 'react';
import ProgressRing from '../components/ProgressRing';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { triggerConfetti } from '../components/Confetti';
import { playCompletionSound, playStreakSound } from '../utils/sound';
import { Trophy } from 'lucide-react';
import './Dashboard.css';

const INITIAL_HABITS = [
    { id: 1, name: 'Morning Stretch', icon: '🧘', completedDates: [] },
    { id: 2, name: 'Drink Water 2L', icon: '💧', completedDates: [] },
    { id: 3, name: 'Read 20 mins', icon: '📚', completedDates: [] },
    { id: 4, name: 'Code Session', icon: '💻', completedDates: [] },
];

const getToday = () => new Date().toISOString().split('T')[0];

const Dashboard = ({ user, onLogout }) => {
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('levelup-habits');
        let parsed = saved ? JSON.parse(saved) : INITIAL_HABITS;

        // Migration: Convert legacy 'completed' bool/streak to completedDates if needed
        // This is a simple migration that assumes current streak is contiguous ending today if completed=true
        return parsed.map(h => {
            if (!Array.isArray(h.completedDates)) {
                return { ...h, completedDates: [], streak: 0 }; // Reset if schema invalid to be safe
            }
            return h;
        });
    });

    const [userLevel, setUserLevel] = useState(5);
    const [userXP, setUserXP] = useState(350);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('levelup-habits', JSON.stringify(habits));
    }, [habits]);

    const today = getToday();

    // Derived state for display
    const todayHabits = habits.map(h => ({
        ...h,
        completed: h.completedDates.includes(today),
        streak: calculateCurrentStreak(h.completedDates)
    }));

    const completedCount = todayHabits.filter(h => h.completed).length;
    const totalCount = habits.length;
    const progress = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

    useEffect(() => {
        if (progress === 100 && totalCount > 0) {
            triggerConfetti();
        }
    }, [progress, totalCount]);

    const toggleHabit = (id) => {
        setHabits(prev => prev.map(h => {
            if (h.id === id) {
                const isCompleted = h.completedDates.includes(today);
                let newDates;

                if (isCompleted) {
                    // Undo completion
                    newDates = h.completedDates.filter(d => d !== today);
                    setUserXP(x => x - 10);
                } else {
                    // Complete
                    newDates = [...h.completedDates, today];
                    setUserXP(x => x + 10);

                    // Sound Effects
                    playCompletionSound();

                    // Check streak milestones
                    const newStreak = calculateCurrentStreak(newDates);
                    if ([3, 7, 30, 365].includes(newStreak)) {
                        setTimeout(() => playStreakSound(newStreak), 300);
                    }
                }

                return { ...h, completedDates: newDates };
            }
            return h;
        }));
    };

    const handleAddHabit = ({ name, icon }) => {
        const newHabit = {
            id: Date.now(),
            name,
            icon,
            completedDates: []
        };
        setHabits(prev => [...prev, newHabit]);
    };

    const handleDeleteHabit = (id) => {
        if (window.confirm("Are you sure you want to delete this quest?")) {
            setHabits(prev => prev.filter(h => h.id !== id));
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="user-profile">
                    <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
                    <div className="user-info">
                        <h1>{user.name}</h1>
                        <span className="level-badge">Level {userLevel}</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-icon logout-btn" onClick={onLogout} title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </button>
                </div>
            </header>

            <main>
                <ProgressRing
                    radius={120}
                    stroke={12}
                    progress={progress}
                    total={totalCount}
                />

                <div className="habits-section">
                    <h2>Today's Quests</h2>
                    <div className="habits-list">
                        {todayHabits.map(habit => (
                            <HabitCard
                                key={habit.id}
                                habit={habit}
                                onToggle={toggleHabit}
                                onDelete={handleDeleteHabit}
                            />
                        ))}
                    </div>
                </div>

                <button
                    className="btn add-habit-btn"
                    onClick={() => setIsModalOpen(true)}
                >
                    + New Quest
                </button>

                <CalendarHeatmap habits={habits} />
            </main>

            <AddHabitModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddHabit}
            />
        </div>
    );
};

// Helper: Calculate streak based on contiguous status ending today or yesterday
const calculateCurrentStreak = (dates) => {
    if (!dates || dates.length === 0) return 0;

    const sorted = [...dates].sort((a, b) => new Date(b) - new Date(a));
    const today = getToday();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Streak must include today or yesterday to be active
    if (!sorted.includes(today) && !sorted.includes(yesterday)) {
        return 0;
    }

    let streak = 0;
    let currentDate = new Date(sorted[0]);

    // If the latest completion is today, start counting from today.
    // If it's yesterday, start counting from yesterday.
    // If it's earlier, streak is 0 (handled above).

    for (let i = 0; i < sorted.length; i++) {
        // Simple logic: consecutive days check could be more robust
        // But for this MVP, we just count contiguous length
        const d = new Date(sorted[i]);
        const diff = (currentDate - d) / (1000 * 60 * 60 * 24);

        if (i === 0) {
            streak = 1;
        } else {
            const prev = new Date(sorted[i - 1]);
            const gap = (prev - d) / (1000 * 60 * 60 * 24);
            if (Math.round(gap) === 1) {
                streak++;
            } else {
                break;
            }
        }
    }
    return streak;
};

export default Dashboard;
