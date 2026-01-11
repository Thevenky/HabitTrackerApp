# Release Notes v1.1

## 🚀 Cloud Migration (Supabase)
- **Backend Integration**: Migrated from `localStorage` to **Supabase**.
- **Cross-Device Sync**: User data (Habits, XP, Level) now syncs across all devices.
- **Secure Authentication**: Implemented Supabase Auth (Sign Up, Sign In).
- **Database Triggers**: Added efficient PostgreSQL triggers (`handle_new_user`) to verify user profile creation security.

## ✨ New Features
- **Daily Reminders**: Users can now set a specific time for each habit. The app will send a browser notification when it's time to "Level Up".
- **Visual Feedback**: Added a clock icon 🕒 to habit cards that have a reminder set.
- **New Icons**: Added **Money** 💰 and **Investment** 📈 icons to the Quest creation list.

## 📱 Mobile Experience (PWA)
- **Polished Icons**: Updated PWA manifest with the new "Level Up" neon logo (192px & 512px).
- **Validation**: Verified "Add to Home Screen" flow and fixed iOS Safari caching issues.

## 🛠 Fixes
- Fixed "row-level security" errors during signup by moving profile creation to the database layer.
- Fixed Safari login issues by validating PWA cache strategies.
