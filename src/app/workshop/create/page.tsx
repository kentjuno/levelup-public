
'use client';

import Link from 'next/link';
import { ArrowLeft, Blocks } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import CreateQuestPackForm from '@/components/workshop/create-quest-pack-form';

export default function CreateWorkshopPage() {
  useRequireAuth();

  return (
    <div className="min-h-screen bg-background font-body text-foreground">
        <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                <Button variant="ghost" asChild>
                    <Link href="/workshop">
                        <ArrowLeft className="mr-2" />
                        Back to Workshop
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold text-primary font-headline flex items-center gap-2">
                    <Blocks />
                    Create Quest Pack
                </h1>
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 max-w-2xl">
            <CreateQuestPackForm />
        </main>
    </div>
  );
}
