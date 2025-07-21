
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, ArrowLeft, Inbox, Bell } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getUserNotifications, markNotificationsAsRead } from '@/services/firestoreService';
import type { Notification } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';


export default function NotificationsPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoadingData(true);
        try {
          const data = await getUserNotifications(user.uid);
          setNotifications(data);
          // Mark as read after fetching
          await markNotificationsAsRead(user.uid);
        } catch (error) {
          console.error("Failed to fetch notifications:", error);
        } finally {
          setIsLoadingData(false);
        }
      }
    }
    fetchData();
  }, [user]);

  if (authLoading || (user && isLoadingData)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

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
                    <Bell /> Notifications
                </h1>
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 flex justify-center">
            <div className="w-full max-w-2xl space-y-4">
                {notifications.length > 0 ? (
                    notifications.map((item) => (
                        <Card key={item.id} className={cn(!item.isRead && "border-primary/50 bg-primary/5")}>
                            <CardHeader className="flex flex-row justify-between items-start pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                                                </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{new Date(item.createdAt).toLocaleString()}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                </div>
                                {!item.isRead && <Badge>New</Badge>}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.message.replace(/\n/g, '<br />') }} />
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-16">
                        <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">All caught up!</h3>
                        <p className="mt-1 text-sm text-muted-foreground">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
}

