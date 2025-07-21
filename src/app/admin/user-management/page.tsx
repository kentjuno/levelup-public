
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as React from 'react';
import { Loader2, ArrowLeft, Users, Search, Save, Zap, Heart, User, Activity } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { isUserAdmin, findUserByEmail, updateUserTier, updateUserEnergy, updateUserHp, getAdminDashboardStats, searchUsersByEmail } from '@/services/firestoreService';
import type { UserTier } from '@/lib/types';
import { TIER_DETAILS, MAX_ENERGY, ENERGY_REGEN_MINUTES, MAX_HP } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type FoundUser = {
  uid: string;
  email: string;
  nickname: string;
  tier: UserTier;
  energy: number;
  hp: number;
  maxHp: number;
};

type EmailSuggestion = {
    uid: string;
    email: string;
};

type DashboardStats = {
    totalUsers: number;
    activeLast7Days: number;
    tierDistribution: Record<string, number>;
    signupsLast30Days: { date: string; count: number }[];
};

export default function UserManagementPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<FoundUser | null>(null);
  const [newEnergy, setNewEnergy] = useState<number | ''>('');
  const [newHp, setNewHp] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [suggestions, setSuggestions] = useState<EmailSuggestion[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);


  useEffect(() => {
    async function checkAdminAndLoadStats() {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          try {
            const stats = await getAdminDashboardStats();
            setDashboardStats(stats);
          } catch (error) {
             console.error('Error fetching dashboard stats:', error);
             toast({ variant: 'destructive', title: 'Error', description: 'Could not load dashboard statistics.' });
          }
        }
        setIsLoadingData(false);
      }
    }
    checkAdminAndLoadStats();
  }, [user, toast]);

  // Debounced effect for email suggestions
  useEffect(() => {
    if (searchEmail.length < 3) {
      setSuggestions([]);
      return;
    }
    const handler = setTimeout(async () => {
        setIsSuggesting(true);
        try {
            const results = await searchUsersByEmail(searchEmail);
            setSuggestions(results);
            setShowSuggestions(results.length > 0);
        } catch (error) {
            console.error("Failed to fetch suggestions:", error);
            setSuggestions([]);
        } finally {
            setIsSuggesting(false);
        }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchEmail]);


  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail) return;
    setIsSearching(true);
    setFoundUser(null);
    setSuggestions([]);
    try {
      const result = await findUserByEmail(searchEmail);
      if (result) {
        let currentEnergy = result.energy;
        if (result.lastEnergyRefill && result.energy < MAX_ENERGY) {
            const now = Date.now();
            const lastRefillTime = new Date(result.lastEnergyRefill).getTime();
            const millisPassed = now - lastRefillTime;
            if (millisPassed > 0) {
              const energyGained = Math.floor(millisPassed / (ENERGY_REGEN_MINUTES * 60 * 1000));
              currentEnergy = Math.min(MAX_ENERGY, result.energy + energyGained);
            }
        }
        setFoundUser({ ...result, energy: currentEnergy });
        setNewEnergy(currentEnergy);
        setNewHp(result.hp);
      } else {
        toast({ variant: 'destructive', title: 'User Not Found', description: `No user found with email: ${searchEmail}`});
      }
    } catch (error) {
      console.error('Error searching for user:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'An error occurred while searching for the user.'});
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleSuggestionClick = (email: string) => {
    setSearchEmail(email);
    setShowSuggestions(false);
  };

  const handleTierChange = async (newTier: UserTier) => {
    if (!foundUser) return;
    setIsSaving(true);
    try {
      await updateUserTier(foundUser.uid, newTier);
      setFoundUser({ ...foundUser, tier: newTier });
      toast({ title: 'Success!', description: `${foundUser.nickname}'s tier has been updated to ${newTier}.` });
    } catch (error) {
      console.error('Error updating tier:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user tier.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnergySave = async () => {
    if (!foundUser || newEnergy === '') return;
    const energyValue = Number(newEnergy);
    if (isNaN(energyValue)) return;

    setIsSaving(true);
    try {
      await updateUserEnergy(foundUser.uid, energyValue);
      const clampedEnergy = Math.min(energyValue, MAX_ENERGY);
      setFoundUser({ ...foundUser, energy: clampedEnergy });
      setNewEnergy(clampedEnergy);
      toast({ title: 'Success!', description: `${foundUser.nickname}'s energy has been updated to ${clampedEnergy}.` });
    } catch (error) {
      console.error('Error updating energy:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user energy.'});
    } finally {
      setIsSaving(false);
    }
  };

  const handleHpSave = async () => {
    if (!foundUser || newHp === '') return;
    const hpValue = Number(newHp);
    if (isNaN(hpValue)) return;

    setIsSaving(true);
    try {
      await updateUserHp(foundUser.uid, hpValue);
      const clampedHp = Math.min(hpValue, foundUser.maxHp);
      setFoundUser({ ...foundUser, hp: clampedHp });
      setNewHp(clampedHp);
      toast({ title: 'Success!', description: `${foundUser.nickname}'s HP has been updated to ${clampedHp}.` });
    } catch (error) {
      console.error('Error updating HP:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update user HP.' });
    } finally {
      setIsSaving(false);
    }
  };


  if (authLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button asChild className="mt-4">
          <Link href="/">Go to Dashboard</Link>
        </Button>
      </div>
    );
  }

  const tierChartData = dashboardStats 
    ? Object.entries(dashboardStats.tierDistribution)
        .filter(([name]) => name !== 'unknown')
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), users: value }))
    : [];

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="ghost" asChild>
            <Link href="/profile">
              <ArrowLeft className="mr-2" />
              Back to Profile
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
            <Users />
            User Management
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Stats Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardStats ? (
                <div className="text-2xl font-bold">{dashboardStats.totalUsers}</div>
              ) : (
                <Skeleton className="h-8 w-1/2" />
              )}
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users (7 days)</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {dashboardStats ? (
                <div className="text-2xl font-bold">{dashboardStats.activeLast7Days}</div>
              ) : (
                <Skeleton className="h-8 w-1/2" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>New Signups (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                    {dashboardStats ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={dashboardStats.signupsLast30Days}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                                <Legend />
                                <Line type="monotone" dataKey="count" name="Signups" stroke="hsl(var(--primary))" />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : <Skeleton className="w-full h-[300px]" />}
                </CardContent>
            </Card>
            <Card className="lg:col-span-3">
                 <CardHeader>
                    <CardTitle>User Tier Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                     {dashboardStats ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={tierChartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis allowDecimals={false} fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))' }} />
                                <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                     ) : <Skeleton className="w-full h-[300px]" />}
                </CardContent>
            </Card>
        </div>
        
        <Separator />

        {/* User Search Section */}
        <div className="flex justify-center">
            <div className="w-full max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                    <CardTitle>Find & Edit User</CardTitle>
                    <CardDescription>Search for a user by their email address to manage their profile.</CardDescription>
                    </CardHeader>
                    <form onSubmit={handleSearch}>
                    <CardContent>
                        <Label htmlFor="email-search">User Email</Label>
                        <div className="relative">
                            <div className="flex gap-2">
                                <Input
                                    id="email-search" type="email" placeholder="user@example.com"
                                    value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    disabled={isSearching} autoComplete="off"
                                />
                                <Button type="submit" disabled={isSearching || !searchEmail}>
                                    {isSearching ? <Loader2 className="animate-spin" /> : <Search />}
                                </Button>
                            </div>
                            {showSuggestions && suggestions.length > 0 && (
                                <Card className="absolute z-10 w-full mt-1 border">
                                    <CardContent className="p-0">
                                        <ul className="py-1">
                                            {suggestions.map(suggestion => (
                                                <li 
                                                    key={suggestion.uid}
                                                    className="px-3 py-2 cursor-pointer hover:bg-accent"
                                                    onMouseDown={() => handleSuggestionClick(suggestion.email)}
                                                >
                                                    {suggestion.email}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            )}
                             {isSuggesting && (
                                <div className="absolute top-1/2 right-20 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </CardContent>
                    </form>
                </Card>

                {foundUser && (
                    <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="h-16 w-16">
                                <AvatarFallback className="text-2xl">{foundUser.nickname.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle>{foundUser.nickname}</CardTitle>
                                <CardDescription>{foundUser.email}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                        <Label htmlFor="tier-select">User Tier</Label>
                        <div className="flex items-center gap-2">
                            <Select value={foundUser.tier} onValueChange={(value: UserTier) => handleTierChange(value)} disabled={isSaving}>
                            <SelectTrigger id="tier-select"><SelectValue placeholder="Select a tier" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(TIER_DETAILS).map(([tierKey, details]) => {
                                const TierIcon = details.icon;
                                return (
                                    <SelectItem key={tierKey} value={tierKey}>
                                    <div className="flex items-center gap-2">
                                        <TierIcon className={cn("h-4 w-4", details.color)} />
                                        <span className="capitalize">{details.name}</span>
                                    </div>
                                    </SelectItem>
                                );
                                })}
                            </SelectContent>
                            </Select>
                            {isSaving && <Loader2 className="animate-spin" />}
                        </div>
                        <p className="text-xs text-muted-foreground">Changing the tier will update the user's quest limits immediately.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                            <Label htmlFor="hp-edit" className="flex items-center gap-1.5"><Heart className="h-4 w-4 text-red-500"/> User HP</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                id="hp-edit" type="number" max={foundUser.maxHp} min={0} value={newHp}
                                onChange={(e) => setNewHp(e.target.value === '' ? '' : Number(e.target.value))} disabled={isSaving}
                                />
                                <Button onClick={handleHpSave} disabled={isSaving || newHp === '' || Number(newHp) === foundUser.hp}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Max: {foundUser.maxHp}.</p>
                            </div>
                            <div className="space-y-2">
                            <Label htmlFor="energy-edit" className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-yellow-500"/> User Energy</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                id="energy-edit" type="number" max={MAX_ENERGY} min={0} value={newEnergy}
                                onChange={(e) => setNewEnergy(e.target.value === '' ? '' : Number(e.target.value))} disabled={isSaving}
                                />
                                <Button onClick={handleEnergySave} disabled={isSaving || newEnergy === '' || Number(newEnergy) === foundUser.energy}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Save />}
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Max: {MAX_ENERGY}. Resets regen timer.</p>
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                )}
            </div>
        </div>
      </main>
    </div>
  );
}
