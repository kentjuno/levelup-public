'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Coffee } from 'lucide-react';
import ThreeDCarousel from './three-d-carousel';

const features = [
  {
    title: 'Custom Quests',
    description: 'Forge your own path by creating personalized quests and daily tasks.',
    imageUrl: '/img/landingpage/customquest.png',
    aiHint: 'writing scroll',
  },
  {
    title: 'Epic Boss Battles',
    description: 'Team up with the community to take down massive weekly bosses.',
    imageUrl: '/img/landingpage/epicboss.png',
    aiHint: 'giant monster',
  },
  {
    title: 'AI-Powered Coach',
    description: 'Get smart, actionable goal suggestions from your personal AI coach.',
    imageUrl: '/img/landingpage/aicoach.png',
    aiHint: 'wise wizard',
  },
  {
    title: 'Track Your Ascension',
    description: 'Watch your stats grow and level up as you conquer your goals.',
    imageUrl: '/img/landingpage/tracking.png',
    aiHint: 'glowing chart',
  },
  {
    title: 'Claim Achievements',
    description: 'Unlock unique achievements and show off your progress.',
    imageUrl: '/img/landingpage/claimachievement.png',
    aiHint: 'golden trophy',
  }
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full font-body bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative h-screen w-full flex flex-col">
        <Image
          src="/img/landingpage/ldpage1.png"
          alt="An epic fantasy landscape at dawn" // Consider updating this alt text to reflect the new image
          data-ai-hint="dramatic fantasy landscape"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col flex-1 text-white">
          <header className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/img/logos/android-chrome-192x192.png" alt="LevelUp Life Logo" width={32} height={32} />
              <span className="text-xl font-bold font-headline text-white">LevelUp Life</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild className="text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
            <div className="space-y-6 max-w-3xl">
              <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg md:text-7xl font-headline">
                Gamify Your Goals. Level Up Your Life.
              </h1>
              <p className="text-lg text-white/80 drop-shadow-md md:text-xl">
                Stop procrastinating and start achieving. Turn your real-life ambitions into exciting quests, track your progress, and become the hero of your own story.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Start Your Adventure <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </main>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-4xl font-bold font-headline md:text-5xl">Forge Your Legend</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
                Your journey to self-improvement is an epic adventure. Here are your tools.
            </p>
            <div className="mt-8">
              <ThreeDCarousel features={features} />
            </div>
        </div>
      </section>

      {/* Support Section */}
      <section className="py-20 sm:py-32 bg-card/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-4xl font-bold font-headline md:text-5xl">Support the Adventure</h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              If you enjoy LevelUp Life, consider supporting its development. Every bit helps keep the adventure going!
            </p>
            <div className="mt-8">
                <a href="https://www.buymeacoffee.com/kentjuno" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg bg-yellow-400 px-6 py-3 font-semibold text-black shadow-md transition-transform hover:scale-105">
                    <Coffee className="mr-2" />
                    Buy Me a Coffee
                </a>
            </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6">
          <div className="container mx-auto text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} LevelUp Life. All rights reserved.
          </div>
      </footer>
    </div>
  );
}
