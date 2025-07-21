

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, User, LogOut, Trophy, Wand2, ShieldCheck, Gem, Star, ArrowLeft, MessageSquarePlus, Users, ClipboardCopy, Settings, BellRing, Camera } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { isUserAdmin, getUserProfile, updateUserNickname, getUserStats, submitFeedback, updateUserAvatar, getUserActivityLog } from '@/services/firestoreService';
import type { Stats, UserTier, ActivityLogEntry } from '@/lib/types';
import { calculateLevelInfo } from '@/lib/xp-system';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AVATAR_OPTIONS, DEFAULT_AVATAR_URL } from '@/lib/avatars';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import StatsChart from '@/components/profile/stats-chart';
import ActivityLogCard from '@/components/profile/activity-log-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TIER_DETAILS } from '@/lib/constants';
import { cn } from '@/lib/utils';


const feedbackSchema = z.object({
  type: z.enum(['bug-report', 'feature-request', 'general-feedback'], {
    required_error: 'Please select a feedback type.',
  }),
  message: z.string().min(10, 'Feedback must be at least 10 characters long.').max(1000, "Feedback can't exceed 1000 characters."),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function ProfilePage() {
  const { user, loading } = useRequireAuth();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(DEFAULT_AVATAR_URL);
  const [isSaving, setIsSaving] = useState(false);
  const [initialNickname, setInitialNickname] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [tier, setTier] = useState<UserTier>('bronze');
  const { toast } = useToast();

  const [stats, setStats] = useState<Stats | null>(null);
  const [levelInfo, setLevelInfo] = useState<{
    level: number;
    totalXp: number;
    xpInLevel: number;
    xpToNextLevel: number;
  } | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);


  const feedbackForm = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'general-feedback',
      message: '',
    },
  });

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoadingProfile(true);
        try {
          const [adminStatus, profile, userStats, logData] = await Promise.all([
            isUserAdmin(user.uid),
            getUserProfile(user.uid),
            getUserStats(user.uid),
            getUserActivityLog(user.uid),
          ]);
          
          setIsAdmin(adminStatus);
          setNickname(profile.nickname);
          setInitialNickname(profile.nickname);
          setTier(profile.tier);
          setInvitationCode(profile.invitationCode);
          setAvatarUrl(profile.avatarUrl);
          
          setStats(userStats);
          const totalXp = Object.values(userStats).reduce((sum, current) => sum + current, 0);
          const calculatedLevelInfo = calculateLevelInfo(totalXp);
          setLevelInfo({ ...calculatedLevelInfo, totalXp });
          
          setActivityLog(logData);

        } catch (error) {
          console.error("Failed to load profile data:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load your profile. Please try again later.",
          });
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchData();
    }
  }, [user, toast]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const handleNicknameSave = async () => {
    if (!user || !nickname.trim() || nickname.trim() === initialNickname) return;
    setIsSaving(true);
    try {
      await updateUserNickname(user.uid, nickname.trim());
      setInitialNickname(nickname.trim());
      toast({
        title: "Success!",
        description: "Your nickname has been updated.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update your nickname.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFeedbackSubmit = async (values: FeedbackFormValues) => {
    if (!user) return;
    setIsSaving(true);
    try {
      await submitFeedback(user.uid, values);
      toast({
        title: "Feedback Sent!",
        description: "Thank you for helping us improve LevelUp Life.",
      });
      feedbackForm.reset();
      setIsFeedbackOpen(false);
    } catch (error) {
      console.error("Failed to send feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not send your feedback. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleAvatarSelect = async (newUrl: string) => {
    if (!user || !newUrl || newUrl === avatarUrl) return;
    setIsSaving(true);
    try {
        await updateUserAvatar(user.uid, newUrl);
        setAvatarUrl(newUrl);
        toast({
            title: "Avatar Updated!",
            description: "Your new look has been saved.",
        });
        setIsAvatarDialogOpen(false);
    } catch (error) {
        console.error("Error updating avatar:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not update your avatar." });
    } finally {
        setIsSaving(false);
    }
  }


  const adminUsersUrl = `https://console.firebase.google.com/project/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/firestore/data/~2Fadmin_users`;
  
  const tierDetails = TIER_DETAILS[tier];
  const currentAvatarHint = AVATAR_OPTIONS.find(o => o.url === avatarUrl)?.aiHint || 'person face';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background font-body">
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary font-headline flex items-center gap-2"><User /> Your Profile</h1>
        </div>
      </header>
      
      <main className="container mx-auto p-4 md:p-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* User Info Card */}
        <Card className="lg:col-span-1">
           <CardHeader className="text-center pt-8">
            {isLoadingProfile ? (
              <>
                <Skeleton className="w-24 h-24 rounded-full mx-auto" />
                <Skeleton className="w-32 h-6 mt-4 mx-auto" />
                <Skeleton className="w-48 h-4 mt-2 mx-auto" />
              </>
            ) : (
              <>
                <div className="relative group mx-auto" onClick={() => setIsAvatarDialogOpen(true)}>
                    <Avatar className="w-24 h-24 mb-4 cursor-pointer">
                        <AvatarImage src={avatarUrl} alt={nickname} data-ai-hint={currentAvatarHint} />
                        <AvatarFallback className="text-3xl">
                            {nickname?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 mb-4 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="h-8 w-8 text-white" />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <CardTitle>{nickname}</CardTitle>
                    {tierDetails && (
                        <Badge variant="outline" className={cn("capitalize border-current", tierDetails.color)}>
                            <tierDetails.icon className="mr-1 h-3 w-3"/>
                            {tierDetails.name}
                        </Badge>
                    )}
                </div>
                <CardDescription>{user?.email}</CardDescription>
              </>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nickname">Edit Nickname</Label>
              {isLoadingProfile ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="nickname"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Your public display name"
                  />
                  <Button onClick={handleNicknameSave} disabled={isSaving || !nickname.trim() || nickname.trim() === initialNickname}>
                    {isSaving ? <Loader2 className="animate-spin" /> : 'Save'}
                  </Button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">This name will be shown on the leaderboard.</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              {isLoadingProfile ? <Skeleton className="h-4 w-full" /> : <p className="text-xs font-mono text-muted-foreground break-all">{user?.uid}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex-col !pt-0 gap-2">
             <Button variant="outline" onClick={() => setIsFeedbackOpen(true)} className="w-full">
                <MessageSquarePlus className="mr-2" /> Send Feedback
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/achievements"><Trophy className="mr-2" /> View Achievements</Link>
            </Button>
            <Button onClick={handleSignOut} className="w-full">
              <LogOut className="mr-2" /> Sign Out
            </Button>
          </CardFooter>
        </Card>

        {/* Level & Stats Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gem className="text-accent" />Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingProfile ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : levelInfo && stats ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-primary">Level {levelInfo.level}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-5 h-5" />
                      <span>{levelInfo.totalXp.toLocaleString()} Total XP</span>
                    </div>
                  </div>
                  <div>
                    <Progress value={(levelInfo.xpInLevel / levelInfo.xpToNextLevel) * 100} className="w-full" />
                    <div className="text-right text-sm text-muted-foreground mt-1">
                      {levelInfo.xpInLevel.toLocaleString()} / {levelInfo.xpToNextLevel.toLocaleString()} XP to next level
                    </div>
                  </div>
                </div>
                <StatsChart stats={stats} />
              </>
            ) : (
              <p className="text-muted-foreground text-center">Could not load stats.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Activity Log Card */}
        <div className="lg:col-span-3">
            <ActivityLogCard activities={activityLog} isLoading={isLoadingProfile} />
        </div>

        {/* Invitation Code Card */}
        <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Your Invitation Code</CardTitle>
              <CardDescription>Share this code with friends so they can join the private beta!</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingProfile ? (
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Input
                    id="invitation-code"
                    value={invitationCode}
                    readOnly
                    className="font-mono text-lg tracking-widest"
                  />
                  <Button variant="outline" size="icon" onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(invitationCode);
                        toast({ title: 'Copied!', description: 'Invitation code copied to clipboard.' });
                      }
                  }}>
                    <ClipboardCopy />
                    <span className="sr-only">Copy Code</span>
                  </Button>
                </div>
              )}
            </CardContent>
        </Card>
        
        {/* Admin Card */}
        {isAdmin && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="text-primary"/> Admin Controls</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
               <Button variant="outline" asChild>
                <Link href="/admin/user-management"><Users className="mr-2" /> Manage Users</Link>
              </Button>
               <Button variant="outline" asChild>
                <Link href="/admin/feedback"><MessageSquarePlus className="mr-2" /> View Feedback</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/boss-generator"><Wand2 className="mr-2" /> Boss Generator</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/admin/tier-management"><Settings className="mr-2" /> Manage Tiers</Link>
              </Button>
               <Button variant="outline" asChild>
                <Link href="/admin/announcements"><BellRing className="mr-2" /> Send Announcement</Link>
              </Button>
               <Button variant="outline" asChild>
                <a href={adminUsersUrl} target="_blank" rel="noopener noreferrer"><ShieldCheck className="mr-2" /> Manage Admins</a>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <Dialog open={isFeedbackOpen} onOpenChange={setIsFeedbackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Your feedback is valuable to us. Let us know what you think!
            </DialogDescription>
          </DialogHeader>
          <Form {...feedbackForm}>
            <form onSubmit={feedbackForm.handleSubmit(handleFeedbackSubmit)} className="space-y-4">
              <FormField
                control={feedbackForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Feedback Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bug-report">Bug Report</SelectItem>
                        <SelectItem value="feature-request">Feature Request</SelectItem>
                        <SelectItem value="general-feedback">General Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={feedbackForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us more..."
                        className="resize-y min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setIsFeedbackOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="animate-spin" /> : 'Submit Feedback'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Choose Your Avatar</DialogTitle>
                <DialogDescription>Select a new avatar from the options below.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 py-4">
                {AVATAR_OPTIONS.map((option) => (
                    <button
                        key={option.id}
                        onClick={() => handleAvatarSelect(option.url)}
                        className={cn(
                            "rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-transform hover:scale-105",
                            avatarUrl === option.url && "ring-2 ring-primary ring-offset-2"
                        )}
                        disabled={isSaving}
                    >
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={option.url} alt={option.aiHint} data-ai-hint={option.aiHint} />
                            <AvatarFallback>{option.id.slice(-1)}</AvatarFallback>
                        </Avatar>
                    </button>
                ))}
            </div>
            {isSaving && <div className="flex justify-center"><Loader2 className="animate-spin" /></div>}
        </DialogContent>
      </Dialog>
    </div>
  );
}
