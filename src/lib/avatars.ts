
export interface AvatarOption {
  id: string;
  url: string;
  aiHint: string;
}

// Avatars from https://www.dicebear.com/ (Adventurer Style)
export const AVATAR_OPTIONS: AvatarOption[] = [
    { id: 'avatar_1', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Leo', aiHint: 'adventurer character' },
    { id: 'avatar_2', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Mia', aiHint: 'adventurer character' },
    { id: 'avatar_3', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Max', aiHint: 'adventurer character' },
    { id: 'avatar_4', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Zoe', aiHint: 'adventurer character' },
    { id: 'avatar_5', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Finn', aiHint: 'adventurer character' },
    { id: 'avatar_6', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Ivy', aiHint: 'adventurer character' },
    { id: 'avatar_7', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Kai', aiHint: 'adventurer character' },
    { id: 'avatar_8', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Luna', aiHint: 'adventurer character' },
    { id: 'avatar_9', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Alex', aiHint: 'adventurer character' },
    { id: 'avatar_10', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Ruby', aiHint: 'adventurer character' },
    { id: 'avatar_11', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Sam', aiHint: 'adventurer character' },
    { id: 'avatar_12', url: 'https://api.dicebear.com/8.x/adventurer/svg?seed=Nora', aiHint: 'adventurer character' },
];

export const DEFAULT_AVATAR_URL = AVATAR_OPTIONS[0].url;
