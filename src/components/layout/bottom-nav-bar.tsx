'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Trophy, Swords, Sparkles, BookOpen, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';

type MainView = 'quests' | 'boss' | 'coach' | 'leaderboard' | 'guide';

interface BottomNavBarProps {
  activeView?: MainView;
}

const BottomNavBar = ({ activeView }: BottomNavBarProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view');

  const navItemClass = "flex flex-col items-center justify-center gap-1 text-muted-foreground transition-colors duration-200 hover:text-primary";
  const activeNavItemClass = "text-primary";
  
  const isViewActive = (view: MainView) => pathname === '/' && (currentView === view || (!currentView && view === 'quests'));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 h-16 border-t bg-background/80 backdrop-blur-sm md:hidden">
      <div className="container mx-auto grid h-full grid-cols-5 items-center">
        <Link href="/?view=leaderboard" className={cn(navItemClass, isViewActive('leaderboard') && activeNavItemClass)}>
          <Trophy className="h-5 w-5" />
          <span className="text-xs">Ranks</span>
        </Link>
        <Link href="/?view=boss" className={cn(navItemClass, isViewActive('boss') && activeNavItemClass)}>
          <Swords className="h-5 w-5" />
          <span className="text-xs">Boss</span>
        </Link>
        
        <div className="flex justify-center">
             <Link 
                href="/?view=quests"
                className={cn(
                    "flex h-16 w-16 -translate-y-4 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground shadow-lg transition-transform duration-300",
                    isViewActive('quests') ? 'scale-110' : 'hover:scale-110'
                )}
             >
                <ScrollText className="h-8 w-8" />
             </Link>
        </div>

        <Link href="/?view=guide" className={cn(navItemClass, isViewActive('guide') && activeNavItemClass)}>
          <BookOpen className="h-5 w-5" />
          <span className="text-xs">Guide</span>
        </Link>
        <Link href="/?view=coach" className={cn(navItemClass, isViewActive('coach') && activeNavItemClass)}>
          <Sparkles className="h-5 w-5" />
          <span className="text-xs">Coach</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavBar;
