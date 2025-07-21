
'use client';

import Link from 'next/link';
import { ArrowLeft, Users, Construction } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GuildsPage() {
  useRequireAuth();

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Button variant="ghost" asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                    <Users />
                    Guilds
                </h1>
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 flex justify-center">
             <Card className="w-full max-w-2xl mt-8">
                <CardHeader className="items-center text-center">
                    <Construction className="h-16 w-16 text-primary" />
                    <CardTitle className="mt-4">Coming Soon!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <CardDescription>
                        The Guilds feature is currently under construction. Soon you'll be able to team up with friends, chat, and climb the leaderboards together. Stay tuned!
                    </CardDescription>
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
