

import type { GeneratePersonalizedGoalOutput } from "@/ai/flows/generate-personalized-goal";

export type StatCategory = 'strength' | 'intelligence' | 'soul';

export type UserTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export type TierSettings = Record<UserTier, { questLimit: number | null; taskLimitPerQuest: number }>;

export type Stats = {
  strength_exp: number,
  intelligence_exp: number,
  soul_exp: number,
}

export type Task = {
  id: string;
  text: string;
  lastCompleted: string | null;
  exp_value: number;
};

export type RecurrenceType = 'once' | 'daily' | 'bi-weekly' | 'monthly' | 'days_of_week';

export type Recurrence = {
  type: RecurrenceType;
  // For 'days_of_week', stores days [0-6] where Sunday is 0.
  days?: number[]; 
};

export type Quest = {
  id: string;
  user_id?: string | null;
  goal_id?: string | null;
  title: string;
  description?: string;
  start_date?: string | null;
  due_date?: string | null;
  completed: boolean;
  exp_category: StatCategory;
  tasks?: Task[];
  exp_value?: number; // For simple, non-task quests or bonus
  completed_at?: string | null;
  created_at: string;
  recurrence?: Recurrence | null;
};

export type QuestPack = {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  creatorNickname: string;
  quests: Omit<Quest, 'id' | 'completed' | 'created_at' | 'user_id' | 'goal_id' | 'completed_at'>[];
  downloads: number;
  upvotes: number;
  createdAt: string; // ISO string
  tags: string[]; // e.g., ['fitness', 'learning']
};

export type WeeklyBoss = {
  id: string; // YYYY-WW format
  title: string;
  description: string;
  totalHp: number;
  currentHp: number;
  appearanceDate: string; // ISO string
  disappearanceDate: string; // ISO string
  isDefeated: boolean;
  taunts: string[];
  flavorQuest: Omit<Quest, 'id' | 'completed' | 'created_at' | 'user_id' | 'goal_id' | 'completed_at' | 'due_date' | 'recurrence' | 'start_date'>;
  imageUrl?: string;
};

export type UserBossContribution = {
  weekId: string;
  damageDealt: number;
  rewardsClaimed: boolean;
  completedFlavorTasks?: string[];
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  aiHint: string;
};

export type UserAchievement = {
  id: string; // Corresponds to Achievement id
  unlockedAt: string;
};

export type UserCounters = {
  quests_completed: number;
  tasks_completed: number;
};

export type AiSuggestion = GeneratePersonalizedGoalOutput & {
  id: string;
  createdAt: string;
};

export type FeedbackStatus = 'new' | 'seen' | 'in-progress' | 'resolved';
export type FeedbackType = 'bug-report' | 'feature-request' | 'general-feedback';

export type Feedback = {
  id: string;
  userId: string;
  userNickname: string;
  userEmail: string;
  type: FeedbackType;
  message: string;
  status: FeedbackStatus;
  createdAt: string; // ISO string
};

export type PublicUserProfile = {
  userId: string;
  nickname: string;
  tier: UserTier;
  avatarUrl: string;
  hp: number;
  maxHp: number;
  stats: Stats;
  counters: UserCounters;
  achievements: UserAchievement[];
  levelInfo: {
    level: number;
    totalXp: number;
  };
};

export type ActivityLogEntry = {
    id: string;
    timestamp: string; // ISO String
    type: 'TASK_COMPLETED' | 'QUEST_COMPLETED' | 'HP_LOST';
    details: {
        questId?: string;
        questTitle?: string;
        taskId?: string;
        taskText?: string;
        xp?: number;
        category?: StatCategory;
        hpChange?: number;
        reason?: string;
    };
};

export type GenerateDailySummaryInput = {
    nickname: string;
    tasksCompleted: number;
    questsCompleted: number;
    xpEarned: number;
    tasksMissed: number;
    hpLost: number;
};

export type GenerateDailySummaryOutput = {
    title: string;
    message: string;
};

export type NotificationType = 'daily-summary' | 'announcement' | 'system' | 'hp-loss';

export type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO string
  isRead: boolean;
  type: NotificationType;
  link?: string;
};

export type Announcement = {
  id: string;
  title: string;
  message: string;
  createdAt: string; // ISO string
};

export type LeaderboardEntry = {
  rank: number;
  name: string;
  damageDealt: number;
  userId: string;
  avatarUrl?: string;
};

export type Guild = {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    memberCount: number;
    weeklyXp: number;
    createdAt: string; // ISO string
};

export type GuildMember = {
    userId: string;
    nickname: string;
    role: 'owner' | 'member';
    joinedAt: string; // ISO string
};
