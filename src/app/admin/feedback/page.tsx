
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import * as React from 'react';
import { Loader2, ArrowLeft, MessageSquare, Bug, Lightbulb } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { getAllFeedback, isUserAdmin } from '@/services/firestoreService';
import type { Feedback, FeedbackType } from '@/lib/types';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';


const typeIconMap: Record<FeedbackType, React.ElementType> = {
  'bug-report': Bug,
  'feature-request': Lightbulb,
  'general-feedback': MessageSquare,
};

const statusColorMap: Record<Feedback['status'], string> = {
  'new': 'bg-blue-500',
  'seen': 'bg-yellow-500',
  'in-progress': 'bg-purple-500',
  'resolved': 'bg-green-500',
}

export default function FeedbackAdminPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (user) {
        setIsLoadingData(true);
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);

        if (adminStatus) {
          try {
            const data = await getAllFeedback();
            setFeedback(data);
          } catch (error) {
            console.error("Failed to fetch feedback:", error);
          }
        }
        setIsLoadingData(false);
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

  if (!isAdmin) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <Button asChild className="mt-4">
                <Link href="/">Go to Dashboard</Link>
            </Button>
        </div>
    )
  }

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
                <h1 className="text-2xl font-bold text-primary font-headline">User Feedback</h1>
            </div>
        </header>

        <main className="container mx-auto p-4 md:p-6 flex justify-center">
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Feedback Inbox</CardTitle>
                    <CardDescription>All feedback submitted by users.</CardDescription>
                </CardHeader>
                <CardContent>
                    {feedback.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[120px]">Date</TableHead>
                                        <TableHead className="w-[150px]">From</TableHead>
                                        <TableHead className="w-[150px]">Type</TableHead>
                                        <TableHead>Message</TableHead>
                                        <TableHead className="w-[100px] text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {feedback.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger>
                                                            <span className="text-muted-foreground text-xs">
                                                                {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>{new Date(entry.createdAt).toLocaleString()}</p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{entry.userNickname}</div>
                                                <div className="text-xs text-muted-foreground">{entry.userEmail}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">
                                                   {React.createElement(typeIconMap[entry.type], { className: "mr-1 h-3 w-3" })}
                                                   {entry.type.replace(/-/g, ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] whitespace-pre-wrap break-words">{entry.message}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="secondary" className="capitalize">
                                                    <span className={cn("h-2 w-2 rounded-full mr-2", statusColorMap[entry.status])}></span>
                                                    {entry.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">
                            The feedback inbox is empty.
                        </p>
                    )}
                </CardContent>
            </Card>
        </main>
    </div>
  );
}
