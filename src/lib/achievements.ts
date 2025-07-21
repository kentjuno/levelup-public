import type { Achievement } from './types';

export const ALL_ACHIEVEMENTS: Achievement[] = [
    // 1. Quest Count
    {
        id: "quest_1",
        name: "And So It Begins",
        description: "Complete your first quest.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=quest_1",
        aiHint: "first step"
    },
    {
        id: "quest_10",
        name: "Getting the Hang of It",
        description: "Complete 10 quests. A habit is forming.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=quest_10",
        aiHint: "growing plant"
    },
    {
        id: "quest_100",
        name: "Quest Master",
        description: "Complete 100 quests. You're serious about this.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=quest_100",
        aiHint: "gold medal"
    },
    
    // New: Task Count Achievements
    {
        id: "task_1",
        name: "A Single Step",
        description: "Complete your first daily task.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=task_1",
        aiHint: "footprint sand"
    },
    {
        id: "task_25",
        name: "Steady Progress",
        description: "Complete 25 daily tasks. Momentum is building.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=task_25",
        aiHint: "stack of stones"
    },
    {
        id: "task_100",
        name: "Task Titan",
        description: "Complete 100 daily tasks. You are unstoppable.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=task_100",
        aiHint: "trophy award"
    },


    // Other achievements from original list
    {
        id: "task_clear_day",
        name: "Quest Cleared",
        description: "Clear your entire quest log in a single day. What a relief.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=task_clear_day",
        aiHint: "checklist done"
    },
    {
        id: "task_combo_5",
        name: "On a Roll!",
        description: "Complete 5 quests in a row. You're on fire!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=task_combo_5",
        aiHint: "fire streak"
    },
    {
        id: "time_early_bird",
        name: "The Early Bird",
        description: "Complete a task before 6 AM. Not everyone can do that.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=time_early_bird",
        aiHint: "early sunrise"
    },
    {
        id: "time_night_owl",
        name: "Night Owl",
        description: "Complete a task after 10 PM. Who needs sleep?",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=time_night_owl",
        aiHint: "owl moon"
    },
    {
        id: "time_streak_7",
        name: "Consistent Challenger",
        description: "Maintain your task momentum for a full week.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=time_streak_7",
        aiHint: "calendar week"
    },
    {
        id: "time_streak_30",
        name: "Legendary Streak",
        description: "Complete tasks for 30 consecutive days. You are a legend!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=time_streak_30",
        aiHint: "crown jewel"
    },
    {
        id: "type_physical_10",
        name: "Strength Training",
        description: "Complete 10 Strength tasks. Feel the power!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=type_physical_10",
        aiHint: "bicep flex"
    },
    {
        id: "type_intellectual_10",
        name: "Brain Power",
        description: "Complete 10 Intelligence tasks. Your IQ is rising!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=type_intellectual_10",
        aiHint: "glowing brain"
    },
    {
        id: "type_soul_10",
        name: "Soul Soother",
        description: "Nurture your spirit 10 times. Your inner self is growing stronger.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=type_soul_10",
        aiHint: "meditating person"
    },
    {
        id: "type_balance_day",
        name: "The Balanced One",
        description: "Complete a Strength, Intelligence, and Soul task in one day. Perfect harmony.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=type_balance_day",
        aiHint: "yin yang"
    },
    {
        id: "diff_hard",
        name: "Challenge Accepted",
        description: "You chose a 'Hard' quest... and completed it. Respect!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=diff_hard",
        aiHint: "climbing mountain"
    },
    {
        id: "diff_boss",
        name: "Boss Defeated",
        description: "You conquered a special quest. You are the main character.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=diff_boss",
        aiHint: "dragon slain"
    },
    {
        id: "diff_speed_3",
        name: "Maximum Overdrive",
        description: "Complete 3 tasks within an hour. Too fast, too furious!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=diff_speed_3",
        aiHint: "lightning bolt"
    },
    {
        id: "discover_feature",
        name: "First Discovery",
        description: "You've just unlocked a new feature. How does it feel?",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=discover_feature",
        aiHint: "treasure chest"
    },
    {
        id: "discover_theme",
        name: "New Look",
        description: "Changed your avatar or theme. Looking stylish!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=discover_theme",
        aiHint: "fashion clothes"
    },
    {
        id: "discover_cancel",
        name: "A Minor Detour",
        description: "Edited or deleted a quest. Everyone needs to backtrack sometimes.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=discover_cancel",
        aiHint: "undo arrow"
    },
    {
        id: "social_invite",
        name: "Never Walk Alone",
        description: "Invited a friend to join the app. You've got a teammate!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=social_invite",
        aiHint: "team handshake"
    },
    {
        id: "social_chat",
        name: "Wise Conversation",
        description: "You chatted with the AI Coach. Communication is power.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=social_chat",
        aiHint: "robot chat"
    },
    {
        id: "social_share",
        name: "Proudly Shared",
        description: "You shared your achievement online. Time to shine!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=social_share",
        aiHint: "social media"
    },
    {
        id: "fun_dopamine",
        name: "Dopamine Overload",
        description: "Claim rewards 10 times in a row. Do you really love this app?",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=fun_dopamine",
        aiHint: "heart explosion"
    },
    {
        id: "fun_slow_but_sure",
        name: "Slow and Steady",
        description: "Complete exactly one task per day for 7 days. Calm down, you Zen master.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=fun_slow_but_sure",
        aiHint: "turtle walking"
    },
    {
        id: "fun_review_week",
        name: "Journey in Review",
        description: "You reviewed your 7-day history. Look back to go further.",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=fun_review_week",
        aiHint: "magnifying glass"
    },
    {
        id: "fun_resurrect",
        name: "Resurrected!",
        description: "Returned after being away for more than 7 days. Welcome back!",
        imageUrl: "https://api.dicebear.com/8.x/bottts-neutral/svg?seed=fun_resurrect",
        aiHint: "phoenix rising"
    }
];
