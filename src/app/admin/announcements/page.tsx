
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, ArrowLeft, Send, BellRing } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { isUserAdmin, sendAnnouncementToAllUsers, getGlobalAnnouncements } from '@/services/firestoreService';
import type { Announcement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const announcementSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters.').max(100, 'Title cannot exceed 100 characters.'),
  message: z.string().min(10, 'Message must be at least 10 characters.').max(1000, 'Message cannot exceed 1000 characters.'),
});

type FormValues = z.infer<typeof announcementSchema>;

export default function AnnouncementPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [history, setHistory] = useState<Announcement[]>([]);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: '', message: '' },
  });

  useEffect(() => {
    async function checkAdminAndLoad() {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          try {
            const announcements = await getGlobalAnnouncements();
            setHistory(announcements);
          } catch (error) {
            console.error("Failed to load announcements:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load announcement history.' });
          }
        }
        setIsLoadingData(false);
      }
    }
    checkAdminAndLoad();
  }, [user, toast]);

  const onSubmit = async (data: FormValues) => {
    try {
      const result = await sendAnnouncementToAllUsers(data.title, data.message);
      toast({
        title: 'Announcement Sent!',
        description: `Your message has been sent to ${result.userCount} users.`,
      });
      form.reset();
      // Refresh history
      const announcements = await getGlobalAnnouncements();
      setHistory(announcements);
    } catch (error) {
      console.error("Failed to send announcement:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not send the announcement.' });
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
            <BellRing />
            Send Announcement
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              Write and send a notification to all active users.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., New Feature Alert!" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message here... This will be sent to every user."
                          className="resize-y min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Send className="mr-2" />
                      Broadcast to All Users
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Announcement History</CardTitle>
            <CardDescription>A log of previously sent announcements.</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sent</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((entry) => (
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
                        <TableCell className="font-medium">{entry.title}</TableCell>
                        <TableCell className="max-w-[200px] whitespace-pre-wrap break-words text-sm text-muted-foreground">{entry.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No announcements sent yet.</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
