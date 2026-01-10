import React from 'react';
import './CalendarHeatmap.css';

const CalendarHeatmap = ({ habits }) => {
    // 1. Calculate the date range aligned to the start of the week (Monday)
    // We want to show 4 full weeks including the current week
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
    // Adjust so 0 is Monday, 6 is Sunday
    const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    // We want to go back 3 full weeks plus the days of the current week passed so far
    // Total days to show = (3 * 7) + (currentDayIndex + 1) -> Actually let's show fixed 4 rows (28 days) ending on THIS Sunday?
    // Or better: Show last 4 weeks aligned.
    // Let's find the Monday of 4 weeks ago.

    const endDate = new Date(today); // Today
    // If we want a fixed grid of 4 weeks (28 days) ending on the coming Sunday (or today if we want rigid past)
    // Let's just make it simple: Last 4 weeks starting from a Monday.

    // Find Monday of the current week
    const currentMonday = new Date(today);
    currentMonday.setDate(today.getDate() - currentDayIndex);

    // Go back 3 more weeks (21 days) to get start date (Monday)
    const startDate = new Date(currentMonday);
    startDate.setDate(currentMonday.getDate() - 21);

    // Generate 28 days from startDate
    const days = Array.from({ length: 28 }, (_, i) => {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        return d.toISOString().split('T')[0];
    });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const getIntensity = (dateStr) => {
        // Don't show future intensity
        if (new Date(dateStr) > new Date()) return -1; // -1 for future

        let completedCount = 0;
        habits.forEach(habit => {
            if (habit.completedDates && habit.completedDates.includes(dateStr)) {
                completedCount++;
            }
        });

        const totalHabits = habits.length;
        if (totalHabits === 0) return 0;

        const ratio = completedCount / totalHabits;
        if (completedCount === 0) return 0;
        if (ratio < 0.4) return 1;
        if (ratio < 0.8) return 2;
        return 3;
    };

    return (
        <div className="heatmap-container">
            <h3>Quest History</h3>
            <div className="heatmap-header">
                {weekDays.map(day => (
                    <span key={day} className="heatmap-day-label">{day}</span>
                ))}
            </div>
            <div className="heatmap-grid">
                {days.map(date => {
                    const intensity = getIntensity(date);
                    return (
                        <div
                            key={date}
                            className={`heatmap-cell intensity-${intensity}`}
                            title={date}
                        ></div>
                    );
                })}
            </div>
            <div className="heatmap-legend">
                <span>Less</span>
                <div className="legend-cell intensity-0"></div>
                <div className="legend-cell intensity-1"></div>
                <div className="legend-cell intensity-2"></div>
                <div className="legend-cell intensity-3"></div>
                <span>More</span>
            </div>
        </div>
    );
};

export default CalendarHeatmap;
