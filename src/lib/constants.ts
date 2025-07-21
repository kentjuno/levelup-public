import type { Quest, StatCategory, UserTier } from './types';
import { HeartPulse, Brain, Sparkles, Shield, ShieldHalf, ShieldCheck, Gem } from 'lucide-react';

export const AI_COACH_CREDIT_COST = 100;
export const MAX_TASKS_PER_QUEST = 5;

// Energy System
export const MAX_ENERGY = 25;
export const ENERGY_REGEN_MINUTES = 10; // 1 energy per 10 minutes
export const ENERGY_PER_HIT = 1; // Cost per hit

// HP System
export const MAX_HP = 100;
export const HP_PER_TASK_COMPLETED = 5;
export const HP_LOST_PER_MISSED_TASK = 10;

export const TIER_DETAILS: Record<UserTier, { name: string; icon: React.ElementType; color: string; }> = {
  bronze: { name: 'Bronze', icon: Shield, color: 'text-orange-600' },
  silver: { name: 'Silver', icon: ShieldHalf, color: 'text-slate-500' },
  gold: { name: 'Gold', icon: ShieldCheck, color: 'text-amber-500' },
  diamond: { name: 'Diamond', icon: Gem, color: 'text-cyan-400' },
};

export const STAT_CATEGORIES: { id: StatCategory; name: string; icon: React.ElementType; color: string; }[] = [
    { id: 'strength', name: 'Strength', icon: HeartPulse, color: 'text-red-500' },
    { id: 'intelligence', name: 'Intelligence', icon: Brain, color: 'text-blue-500' },
    { id: 'soul', name: 'Soul', icon: Sparkles, color: 'text-purple-500' },
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'welcome-1',
    title: 'Review your first quests',
    description: 'Check out the quests below to get started.',
    completed: false,
    exp_value: 10,
    exp_category: 'intelligence',
    created_at: new Date().toISOString(),
    start_date: new Date().toISOString(),
    recurrence: { type: 'daily' },
  },
  {
    id: 'welcome-2',
    title: 'Create your first custom quest',
    description: 'Click "New Quest" to create your own quest with daily tasks.',
    completed: false,
    exp_value: 25,
    exp_category: 'soul',
    created_at: new Date().toISOString(),
    start_date: new Date().toISOString(),
    recurrence: { type: 'daily' },
  },
   {
    id: 'welcome-3',
    title: 'Explore the AI Goal Suggester',
    description: 'Get personalized goals from the AI coach on the right.',
    completed: false,
    exp_value: 15,
    exp_category: 'intelligence',
    created_at: new Date().toISOString(),
    start_date: new Date().toISOString(),
    recurrence: { type: 'daily' },
  },
];

export const QUEST_TEMPLATES: Omit<Quest, 'id' | 'completed' | 'created_at'>[] = [
  {
    title: 'Morning Routine: Hydrate and Stretch',
    description: 'Start the day right by drinking a full glass of water and doing 5 minutes of stretching.',
    exp_category: 'strength',
    tasks: [
      { id: '1', text: 'Drink a glass of water', lastCompleted: null, exp_value: 5 },
      { id: '2', text: 'Stretch for 5 minutes', lastCompleted: null, exp_value: 5 },
    ],
  },
  {
    title: '30-Day Fitness Challenge',
    description: 'Engage in physical activity every day for 30 days.',
    exp_category: 'strength',
     tasks: [
      { id: '1', text: 'Day 1: 30 min workout', lastCompleted: null, exp_value: 50 },
      { id: '2', text: 'Day 2: 30 min workout', lastCompleted: null, exp_value: 50 },
    ],
  },
  {
    title: 'Read "Sapiens: A Brief History of Humankind"',
    description: 'Dedicate time to reading for personal or professional growth.',
    exp_category: 'intelligence',
    tasks: [
      { id: '1', text: 'Read Chapter 1', lastCompleted: null, exp_value: 20 },
      { id: '2', text: 'Read Chapter 2', lastCompleted: null, exp_value: 20 },
    ],
  },
  {
    title: 'Master Daily Planning',
    description: 'Take 10 minutes to outline your top 3 priorities for the day.',
    exp_category: 'soul',
     tasks: [
      { id: '1', text: 'Plan my day', lastCompleted: null, exp_value: 15 },
    ],
  },
  {
    title: 'Tidy Up Your Workspace',
    description: 'A clean space for a clear mind. Spend 5 minutes organizing your desk.',
    exp_category: 'soul',
    tasks: [
      { id: '1', text: 'Organize desk for 5 mins', lastCompleted: null, exp_value: 10 },
    ],
  },
  {
    title: 'Learn a New Skill: Basic Python',
    description: 'Watch a tutorial, read an article, or practice a new skill.',
    exp_category: 'intelligence',
    tasks: [
      { id: '1', text: 'Complete a 15-min Python tutorial', lastCompleted: null, exp_value: 25 },
    ],
  },
];
