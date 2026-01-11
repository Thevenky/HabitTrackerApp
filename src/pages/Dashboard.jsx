import React, { useState, useEffect } from 'react';
import ProgressRing from '../components/ProgressRing';
import HabitCard from '../components/HabitCard';
import AddHabitModal from '../components/AddHabitModal';
import CalendarHeatmap from '../components/CalendarHeatmap';
import { triggerConfetti } from '../components/Confetti';
import { playCompletionSound, playStreakSound } from '../utils/sound';
import { supabase } from '../supabase';
import './Dashboard.css';

const getToday = () => new Date().toISOString().split('T')[0];

const Dashboard = ({ user, onLogout }) => {
    const [habits, setHabits] = useState([]);
    const [userLevel, setUserLevel] = useState(user.level || 1);
    const [userXP, setUserXP] = useState(user.xp || 0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial Fetch
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission();
        }

        const fetchHabits = async () => {
            const { data, error } = await supabase
                .from('habits')
                .select('*')
                .eq('user_id', user.id)
                .order('id', { ascending: true });

            if (!error && data) {
                setHabits(data.map(h => ({
                    ...h,
                    // Supabase arrays come back as arrays, but ensure it's not null
                    completedDates: h.completed_dates || [],
                    reminderTime: h.reminder_time // Map new column
                })));
            }
        };

        const fetchProfile = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('level, xp')
                .eq('id', user.id)
                .single();
            if (data) {
                setUserLevel(data.level);
                setUserXP(data.xp);
            }
        };

        fetchHabits();
        fetchProfile();
    }, [user.id]);

    // Reminder Check Interval
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            habits.forEach(habit => {
                if (habit.reminderTime === currentTime && !habit.completedDates.includes(getToday())) {
                    if (Notification.permission === 'granted') {
                        new Notification(`Time for ${habit.name}!`, {
                            body: `Take a moment to ${habit.name} ${habit.icon}`,
                            icon: '/pwa-192x192.png'
                        });
                    }
                }
            });
        };

        const interval = setInterval(checkReminders, 30000);
        return () => clearInterval(interval);
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

    const updateProfileStats = async (xpChange) => {
        const newXP = userXP + xpChange;
        const newLevel = Math.floor(newXP / 100) + 1;

        setUserXP(newXP);
        setUserLevel(newLevel);

        await supabase
            .from('profiles')
            .update({ xp: newXP, level: newLevel })
            .eq('id', user.id);
    };

    const toggleHabit = async (id) => {
        const habitToToggle = habits.find(h => h.id === id);
        if (!habitToToggle) return;

        const isCompleted = habitToToggle.completedDates.includes(today);
        let newDates;

        if (isCompleted) {
            newDates = habitToToggle.completedDates.filter(d => d !== today);
            updateProfileStats(-10);
        } else {
            newDates = [...habitToToggle.completedDates, today];
            updateProfileStats(10);
            playCompletionSound();

            const newStreak = calculateCurrentStreak(newDates);
            if ([3, 7, 30, 365].includes(newStreak)) {
                setTimeout(() => playStreakSound(newStreak), 300);
            }
        }

        // Optimistic UI Update
        setHabits(prev => prev.map(h => h.id === id ? { ...h, completedDates: newDates } : h));

        // DB Update
        await supabase
            .from('habits')
            .update({ completed_dates: newDates })
            .eq('id', id);
    };

    const handleAddHabit = async ({ name, icon, reminderTime }) => {
        const newHabit = {
            user_id: user.id,
            name,
            icon,
            reminder_time: reminderTime,
            completed_dates: []
        };

        // DB Insert
        const { data, error } = await supabase
            .from('habits')
            .insert([newHabit])
            .select()
            .single();

        if (data && !error) {
            setHabits(prev => [...prev, {
                ...data,
                completedDates: [],
                reminderTime: data.reminder_time // Map return value
            }]);
        }
    };

    const handleDeleteHabit = async (id) => {
        if (window.confirm("Are you sure you want to delete this quest?")) {
            setHabits(prev => prev.filter(h => h.id !== id));
            await supabase.from('habits').delete().eq('id', id);
        }
    };

    return (
        <div className="dashboard">
            <header className="dashboard-header">
                <div className="user-profile">
                    <div className="avatar" onClick={() => setIsModalOpen('profile')} style={{ cursor: 'pointer' }}>
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
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
                    onClick={() => setIsModalOpen('addHabit')}
                >
                    + New Quest
                </button>

                <CalendarHeatmap habits={habits} />
            </main>

            <AddHabitModal
                isOpen={isModalOpen === 'addHabit'}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddHabit}
            />

            {isModalOpen === 'profile' && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content profile-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        <h2>Player Profile</h2>

                        <div className="profile-details">
                            <div className="detail-group">
                                <label>Name</label>
                                <div className="detail-value">{user.name}</div>
                            </div>
                            <div className="detail-group">
                                <label>Email</label>
                                <div className="detail-value">{user.email}</div>
                            </div>
                            <div className="detail-group">
                                <label>Password</label>
                                <div className="detail-value password-value">
                                    Protected
                                </div>
                            </div>
                            <div className="detail-group">
                                <label>Joined On</label>
                                <div className="detail-value">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : (user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
