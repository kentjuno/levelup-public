
export type ChangeType = "new" | "improvement" | "fix";

export interface Change {
  type: ChangeType;
  description: string;
}

export interface ChangelogEntry {
  version: string;
  date: string; // "YYYY-MM-DD"
  title: string;
  changes: Change[];
}

export const changelogs: ChangelogEntry[] = [
    {
        version: "2.1.0",
        date: "2025-07-08",
        title: "Performance & UX Polish",
        changes: [
            { type: "improvement", description: "Unified the app experience by merging the Leaderboard and Guide into the main dashboard, eliminating page reloads for a seamless feel." },
            { type: "new", description: "Players can now personalize their profile by choosing from a selection of new 'adventurer' style avatars." },
            { type: "improvement", description: "Enhanced the Progressive Web App (PWA) caching for fonts and images to improve load times and enable better offline functionality." },
            { type: "fix", description: "Fixed the email verification flow by adding a dedicated page to correctly handle confirmation links from Firebase." },
        ],
    },
    {
        version: "2.0.0",
        date: "2025-07-08",
        title: "Community & Security Update",
        changes: [
            { type: "new", description: "Admins can now broadcast announcements to all users via a new admin page." },
            { type: "new", description: "Implemented a mandatory email verification flow for new signups to improve account security and user quality." },
            { type: "improvement", description: "Rebalanced the daily HP deduction and low-HP XP gain formulas to be more fair and engaging." },
        ],
    },
    {
        version: "1.9.0",
        date: "2025-07-08",
        title: "Visual Overhaul & 3D Showcase",
        changes: [
            { type: "new", description: "Replaced the landing page feature carousel with a custom-built, seamless 3D carousel for a premium look and feel." },
            { type: "improvement", description: "Completely redesigned the application's color scheme with a new 'Fire & Earth' theme for both Light and Dark modes." },
            { type: "fix", description: "Resolved a critical bug that prevented user profiles from loading from the leaderboard." },
        ],
    },
    {
        version: "1.8.0",
        date: "2025-07-07",
        title: "Player Vitality & Strategic Combat",
        changes: [
            { type: "new", description: "Player HP system introduced! Complete tasks to restore HP, but miss them and you'll take damage." },
            { type: "new", description: "Energy is now required for boss attacks and regenerates over time. The dashboard shows a countdown to your next point." },
            { type: "new", description: "Receive a daily summary notification with your previous day's stats and HP changes." },
            { type: "improvement", description: "Boss attacks are now a full-screen cinematic sequence!" },
            { type: "improvement", description: "Weekly boss rewards are now more competitive (Top 10 only, starting at 100 credits)." },
            { type: "new", description: "Admin tools expanded to edit user HP/Energy and set custom boss deadlines." },
            { type: "fix", description: "Prevented attacks on bosses whose deadlines have passed." },
        ],
    },
    {
        version: "1.7.5",
        date: "2025-07-06",
        title: "Gamer UI & Advanced Quests",
        changes: [
            { type: "new", description: "Complete UI overhaul with a mobile-first bottom navigation bar and a new responsive Player Header." },
            { type: "improvement", description: "Quest view is now organized into 'Today', 'All Active', and 'Completed' tabs." },
            { type: "new", description: "Added a 'Once' recurrence option for non-repeating quests." },
            { type: "improvement", description: "Bottom navigation icons updated to be more intuitive (`Swords` for Boss, `ScrollText` for Quests)." },
            { type: "fix", description: "Major code refactoring to improve performance and resolve several module loading errors." },
        ],
    },
    {
        version: "1.7.0",
        date: "2025-07-05",
        title: "Invitation System & Streamlined Onboarding",
        changes: [
            { type: "new", description: "Replaced the manual user approval system with an invitation code system." },
            { type: "new", description: "Each user now has a unique invitation code on their profile page to share with friends." },
            { type: "improvement", description: "The signup process is now fully automated for users with a valid invitation code." },
            { type: "fix", description: "The user guide has been updated to explain the new invitation-based registration." },
        ],
    },
    {
        version: "1.6.0",
        date: "2025-07-04",
        title: "Advanced Quest Scheduling",
        changes: [
            { type: "new", description: "Added a new 'Bi-weekly' (every 2 weeks) recurrence option for quests." },
            { type: "improvement", description: "Generalized 'Daily Tasks' to 'Repeatable Tasks' throughout the app to better reflect flexible scheduling options." },
            { type: "improvement", description: "The user guide has been updated to explain the new recurrence system." },
        ],
    },
    {
        version: "1.5.0",
        date: "2025-07-01",
        title: "User Tiers & Admin Controls",
        changes: [
            { type: "new", description: "Introduced user tiers: Bronze, Silver, Gold, and Diamond, each with increasing quest limits." },
            { type: "new", description: "Added a new User Management page for admins to view and set user tiers." },
            { type: "improvement", description: "User profiles now display a badge for their current tier." },
            { type: "improvement", description: "Quest limits are now dynamically enforced based on the user's tier." },
        ],
    },
    {
        version: "1.4.0",
        date: "2025-06-28",
        title: "Flexible Quest Scheduling",
        changes: [
            { type: "new", description: "Added flexible recurrence options for quests. You can now set quests to repeat daily, weekly, monthly, or on specific days of the week." },
            { type: "improvement", description: "Tasks in the quest card now visually indicate if they are not scheduled for today, reducing daily clutter." },
            { type: "fix", description: "The 'Due Date' picker in the quest form now displays correctly on mobile devices." },
        ],
    },
    {
        version: "1.3.0",
        date: "2025-06-25",
        title: "Transparency & Community",
        changes: [
            { type: "new", description: "Added a changelog page so you can track all the new features and fixes." },
            { type: "new", description: "You can now click on players in the leaderboard to view their public profile." },
            { type: "improvement", description: "The leaderboard is now more interactive." },
        ],
    },
    {
        version: "1.2.0",
        date: "2025-06-22",
        title: "Inspiration & Visualization",
        changes: [
            { type: "new", description: "Added a daily motivational quote to the dashboard to kickstart your day." },
            { type: "improvement", description: "Stats distribution is now a beautiful Radar Chart for better visualization of your progress." },
            { type: "fix", description: "Fixed an accessibility issue with dialogs missing a title." },
        ],
    },
    {
        version: "1.1.0",
        date: "2025-06-18",
        title: "Boss Battle Overhaul",
        changes: [
            { type: "new", description: "Introduced a 'Charged Power' system for strategic boss attacks." },
            { type: "improvement", description: "Boss attack animations are now more dynamic with varied timings and names for each hit." },
            { type: "fix", description: "Fixed a critical issue where unchecking a completed task did not correctly reverse boss damage and contributions." },
            { type: "fix", description: "Corrected hit count calculation when checking and unchecking tasks multiple times." },
        ],
    },
    {
        version: "1.0.0",
        date: "2025-06-15",
        title: "Initial Release",
        changes: [
            { type: "new", description: "Welcome to LevelUp Life! Gamify your goals and level up your life." },
            { type: "new", description: "Core features: Quest and Task management, XP and Leveling system, AI Goal Coach, and Weekly Boss battles." },
        ],
    },
];
