
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Trophy, Crown, Medal } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getWeeklyLeaderboard, getPublicUserProfile, getUserData } from '@/services/firestoreService';
import type { LeaderboardEntry } from '@/services/firestoreService';
import { getWeekId } from '@/lib/bosses';
import type { PublicUserProfile } from '@/lib/types';
import { calculateLevelInfo } from '@/lib/xp-system';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import PublicProfileCard from '@/components/leaderboard/public-profile-card';
import { useToast } from '@/hooks/use-toast';
import PlayerHeader from '@/components/layout/player-header';
import BottomNavBar from '@/components/layout/bottom-nav-bar';
import { MAX_ENERGY, ENERGY_REGEN_MINUTES } from '@/lib/constants';

export default function LeaderboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const currentWeekId = getWeekId(new Date());

  const [selectedProfile, setSelectedProfile] = useState<PublicUserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const [nickname, setNickname] = useState('');
  const [level, setLevel] = useState(1);
  const [hp, setHp] = useState(0);
  const [maxHp, setMaxHp] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [maxEnergy, setMaxEnergy] = useState(0);


  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoadingData(true);
        try {
          const [leaderboardData, userData] = await Promise.all([
            getWeeklyLeaderboard(currentWeekId),
            getUserData(user.uid)
          ]);
          setLeaderboard(leaderboardData);
          if (userData) {
            setNickname(userData.nickname);
            setHp(userData.hp);
            setMaxHp(userData.maxHp);
            
            const totalXp = Object.values(userData.stats).reduce((a, b) => a + b, 0);
            const levelInfo = calculateLevelInfo(totalXp);
            setLevel(levelInfo.level);

            let currentEnergy = userData.energy;
            if (userData.lastEnergyRefill && userData.energy < MAX_ENERGY) {
                const now = Date.now();
                const lastRefillTime = new Date(userData.lastEnergyRefill).getTime();
                const millisPassed = now - lastRefillTime;
                if (millisPassed > 0) {
                    const energyGained = Math.floor(millisPassed / (ENERGY_REGEN_MINUTES * 60 * 1000));
                    currentEnergy = Math.min(MAX_ENERGY, userData.energy + energyGained);
                }
            }
            setEnergy(currentEnergy);
            setMaxEnergy(MAX_ENERGY);
          }
        } catch (error) {
          console.error("Failed to fetch page data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load the leaderboard data.",
          });
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    fetchData();
  }, [user, currentWeekId, toast]);
  
  const handleRowClick = async (userId: string) => {
    setIsDialogOpen(true);
    setIsProfileLoading(true);
    setSelectedProfile(null);
    try {
        const profile = await getPublicUserProfile(userId);
        setSelectedProfile(profile);
    } catch (error) {
        console.error("Failed to load user profile:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load user profile.",
          });
    } finally {
        setIsProfileLoading(false);
    }
  }

  const player1 = leaderboard.find(p => p.rank === 1);
  const player2 = leaderboard.find(p => p.rank === 2);
  const player3 = leaderboard.find(p => p.rank === 3);
  const restOfLeaderboard = leaderboard.filter(p => p.rank > 3);

  if (authLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
        <PlayerHeader
          nickname={nickname}
          level={level}
          hp={hp}
          maxHp={maxHp}
          energy={energy}
          maxEnergy={maxEnergy}
        />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-6">
            <div className="container mx-auto p-4 md:p-6 flex justify-center">
                <Card className="w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Trophy /> Weekly Leaderboard</CardTitle>
                        <CardDescription>Damage rankings for the weekly boss (Week {currentWeekId}). Click a player to view their profile.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length > 0 ? (
                            <div className="space-y-8">
                                {/* Podium Section */}
                                <div className="flex justify-center items-end gap-2 sm:gap-4 mt-4">
                                    {/* Rank 2 */}
                                    <div className="w-1/3 flex flex-col items-center order-1 pt-8">
                                        {player2 && (
                                            <div
                                                className="flex flex-col items-center w-full cursor-pointer text-center group"
                                                onClick={() => handleRowClick(player2.userId)}
                                            >
                                                <Medal className="h-8 w-8 text-slate-400 mb-1" />
                                                <Avatar className="h-16 w-16 mb-2 border-4 border-slate-400 group-hover:scale-105 transition-transform">
                                                    <AvatarFallback>{player2.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-bold truncate w-full">{player2.name}</p>
                                                <p className="text-sm text-muted-foreground">{player2.damageDealt.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Rank 1 */}
                                    <div className="w-1/3 flex flex-col items-center order-2">
                                        {player1 && (
                                            <div
                                                className="flex flex-col items-center w-full cursor-pointer text-center group"
                                                onClick={() => handleRowClick(player1.userId)}
                                            >
                                                <Crown className="h-10 w-10 text-amber-400 mb-1" />
                                                <Avatar className="h-20 w-20 mb-2 border-4 border-amber-400 group-hover:scale-105 transition-transform">
                                                    <AvatarFallback className="text-2xl">{player1.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-bold text-lg truncate w-full">{player1.name}</p>
                                                <p className="text-sm text-muted-foreground">{player1.damageDealt.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Rank 3 */}
                                    <div className="w-1/3 flex flex-col items-center order-3 pt-8">
                                        {player3 && (
                                            <div
                                                className="flex flex-col items-center w-full cursor-pointer text-center group"
                                                onClick={() => handleRowClick(player3.userId)}
                                            >
                                                <Medal className="h-8 w-8 text-orange-600 mb-1" />
                                                <Avatar className="h-16 w-16 mb-2 border-4 border-orange-600 group-hover:scale-105 transition-transform">
                                                    <AvatarFallback>{player3.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-bold truncate w-full">{player3.name}</p>
                                                <p className="text-sm text-muted-foreground">{player3.damageDealt.toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* List Section for ranks 4+ */}
                                {restOfLeaderboard.length > 0 && (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px] text-center px-2">Rank</TableHead>
                                                <TableHead className="px-2">Player</TableHead>
                                                <TableHead className="text-right px-2">Damage Dealt</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {restOfLeaderboard.map((entry) => (
                                                <TableRow 
                                                    key={entry.userId} 
                                                    className={cn("cursor-pointer", entry.userId === user?.uid && 'bg-primary/10')}
                                                    onClick={() => handleRowClick(entry.userId)}
                                                >
                                                    <TableCell className="p-2 font-bold text-center text-muted-foreground">{entry.rank}</TableCell>
                                                    <TableCell className="p-2">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8">
                                                                <AvatarFallback>{entry.name.charAt(0).toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium truncate">{entry.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="p-2 text-right font-mono">{entry.damageDealt.toLocaleString()}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-8">
                                No one has damaged the boss yet. Be the first!
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
        
        <BottomNavBar />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-md p-0">
                {isProfileLoading && (
                    <>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Loading Player Profile</DialogTitle>
                            <DialogDescription>Please wait while the player data is being fetched.</DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-center items-center h-96">
                            <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                    </>
                )}
                {!isProfileLoading && selectedProfile && (
                    <>
                        <DialogHeader className="sr-only">
                            <DialogTitle>Player Profile: {selectedProfile.nickname}</DialogTitle>
                            <DialogDescription>
                                A summary of this player's stats, achievements, and progress.
                            </DialogDescription>
                        </DialogHeader>
                        <PublicProfileCard profile={selectedProfile} />
                    </>
                )}
                {!isProfileLoading && !selectedProfile && (
                    <div className="p-6 text-center h-96 flex flex-col justify-center items-center">
                        <DialogHeader>
                           <DialogTitle>Could Not Load Profile</DialogTitle>
                           <DialogDescription>The user may not exist or an error occurred.</DialogDescription>
                        </DialogHeader>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    </div>
  );
}
