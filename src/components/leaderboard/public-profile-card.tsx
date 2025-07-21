

'use client';

import Image from 'next/image';
import { Gem, Star, CheckSquare, BookCheck } from 'lucide-react';
import type { PublicUserProfile } from '@/lib/types';
import { ALL_ACHIEVEMENTS } from '@/lib/achievements';
import { TIER_DETAILS } from '@/lib/constants';
import { cn } from '@/lib/utils';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import StatsChart from '@/components/profile/stats-chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PublicProfileCardProps {
  profile: PublicUserProfile;
}

export default function PublicProfileCard({ profile }: PublicProfileCardProps) {
    const unlockedAchievements = profile.achievements.map(ua => {
        return ALL_ACHIEVEMENTS.find(a => a.id === ua.id);
    }).filter((a): a is NonNullable<typeof a> => a !== undefined).slice(0, 5); // show latest 5

    const tierDetails = TIER_DETAILS[profile.tier || 'bronze'];

    return (
        <Card className="border-none shadow-none">
             <CardHeader className="text-center items-center pb-4 pt-6">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile.avatarUrl} alt={profile.nickname} />
                  <AvatarFallback className="text-3xl">
                    {profile.nickname?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{profile.nickname}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {tierDetails && (
                        <Badge variant="outline" className={cn("capitalize border-current", tierDetails.color)}>
                            <tierDetails.icon className="mr-1 h-3 w-3"/>
                            {tierDetails.name}
                        </Badge>
                    )}
                    <Badge variant="secondary">
                        <Gem className="mr-1" /> Level {profile.levelInfo.level}
                    </Badge>
                     <Badge variant="secondary">
                        <Star className="mr-1 text-amber-500" /> {profile.levelInfo.totalXp.toLocaleString()} Total XP
                    </Badge>
                </div>
             </CardHeader>
             <CardContent className="space-y-6">
                <div>
                    <h3 className="text-center text-sm font-medium text-muted-foreground mb-2">Stats Distribution</h3>
                    <StatsChart stats={profile.stats} />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-muted p-3 rounded-lg">
                        <BookCheck className="mx-auto mb-1 h-5 w-5 text-primary" />
                        <p className="text-xl font-bold">{profile.counters.quests_completed.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Quests Completed</p>
                    </div>
                     <div className="bg-muted p-3 rounded-lg">
                        <CheckSquare className="mx-auto mb-1 h-5 w-5 text-primary" />
                        <p className="text-xl font-bold">{profile.counters.tasks_completed.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Tasks Completed</p>
                    </div>
                </div>

                {unlockedAchievements.length > 0 && (
                     <div>
                        <h3 className="text-center text-sm font-medium text-muted-foreground mb-3">Recent Achievements</h3>
                        <TooltipProvider>
                            <div className="flex justify-center gap-3">
                                {unlockedAchievements.map(ach => (
                                    <Tooltip key={ach.id}>
                                        <TooltipTrigger asChild>
                                            <Image
                                                src={ach.imageUrl}
                                                alt={ach.name}
                                                width={48}
                                                height={48}
                                                data-ai-hint={ach.aiHint}
                                                className="rounded-full border-2 border-amber-400"
                                                unoptimized
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-bold">{ach.name}</p>
                                            <p className="text-muted-foreground">{ach.description}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </TooltipProvider>
                    </div>
                )}

             </CardContent>
        </Card>
    )
}
