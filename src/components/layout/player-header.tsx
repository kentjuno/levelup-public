
'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Trophy, GitCommit, LogOut, Sun, Moon, Heart, Zap, Bell, Swords, BookOpen, Sparkles, ScrollText, Users, Blocks } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth-context';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';

type MainView = 'quests' | 'boss' | 'coach' | 'leaderboard' | 'guide';

interface PlayerHeaderProps {
  nickname: string;
  avatarUrl?: string;
  level: number;
  activeView?: MainView;
  hp?: number;
  maxHp?: number;
  energy?: number;
  maxEnergy?: number;
  unreadNotificationCount?: number;
}

export default function PlayerHeader({ nickname, avatarUrl, level = 1, activeView, hp, maxHp, energy, maxEnergy, unreadNotificationCount = 0 }: PlayerHeaderProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const navItemClass = "transition-colors hover:text-primary";
  const activeNavItemClass = "text-primary";
  
  const isViewActive = (view: MainView) => pathname === '/' && (currentView === view || (!currentView && view === 'quests'));

  const hpPercentage = (hp !== undefined && maxHp !== undefined && maxHp > 0) ? (hp / maxHp) * 100 : 0;
  const energyPercentage = (energy !== undefined && maxEnergy !== undefined && maxEnergy > 0) ? (energy / maxEnergy) * 100 : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:gap-4">
        {/* Left side: Player Info */}
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2">
                <img src="/img/logos/android-chrome-192x192.png" alt="LevelUp Life Logo" className="h-8 w-8 flex-shrink-0" />
                <span className="font-bold text-base sm:text-lg hidden sm:inline">LevelUp Life</span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/?view=quests" className={cn(navItemClass, isViewActive('quests') && activeNavItemClass)}>
            Quests
          </Link>
           <Link href="/?view=boss" className={cn(navItemClass, isViewActive('boss') && activeNavItemClass)}>
            Boss
          </Link>
          <Link href="/?view=leaderboard" className={cn(navItemClass, isViewActive('leaderboard') && activeNavItemClass)}>
            Leaderboard
          </Link>
          <Link href="/?view=guide" className={cn(navItemClass, isViewActive('guide') && activeNavItemClass)}>
            Guide
          </Link>
          <Link href="/?view=coach" className={cn(navItemClass, isViewActive('coach') && activeNavItemClass)}>
            AI Coach
          </Link>
        </nav>

        {/* Right side: User Menu */}
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {/* Mobile stats display */}
            {(hp !== undefined && maxHp !== undefined && energy !== undefined && maxEnergy !== undefined) && (
                <div className="flex flex-col items-end text-xs md:hidden">
                    <span className="font-bold text-primary">LVL {level}</span>
                    <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3 text-red-500"/>
                        <span>{hp}/{maxHp}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500"/>
                        <span>{energy}/{maxEnergy}</span>
                    </div>
                </div>
            )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className="relative">
                    <Avatar className="h-10 w-10 cursor-pointer flex-shrink-0">
                        <AvatarImage src={avatarUrl} alt={nickname} />
                        <AvatarFallback>
                            {nickname ? nickname.charAt(0).toUpperCase() : <User />}
                        </AvatarFallback>
                    </Avatar>
                    {unreadNotificationCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0 text-xs">
                            {unreadNotificationCount}
                        </Badge>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{nickname}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                
                {(hp !== undefined && maxHp !== undefined && energy !== undefined && maxEnergy !== undefined) && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="p-2 space-y-2">
                            {/* Desktop View */}
                            <div className="hidden md:flex flex-col gap-2">
                                <div className="flex items-center gap-1.5" title="Health Points">
                                    <Heart className="h-4 w-4 text-red-500 flex-shrink-0" />
                                    <div className="w-full">
                                        <Progress value={hpPercentage} className="h-2 [&>div]:bg-red-500" />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">{hp}/{maxHp}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Energy">
                                    <Zap className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                    <div className="w-full">
                                        <Progress value={energyPercentage} className="h-2" />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground">{energy}/{maxEnergy}</span>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile"><User /> My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/guilds"><Users /> Guilds</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/notifications" className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Bell /> Notifications
                        </div>
                        {unreadNotificationCount > 0 && (
                            <Badge variant="destructive">{unreadNotificationCount}</Badge>
                        )}
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/achievements"><Trophy /> Achievements</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/workshop"><Blocks /> Workshop</Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/changelog"><GitCommit /> Changelog</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut /> Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
