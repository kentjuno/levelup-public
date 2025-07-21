
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ArrowLeft, Save, Settings } from 'lucide-react';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { isUserAdmin, getTierSettings, updateTierSettings } from '@/services/firestoreService';
import type { TierSettings, UserTier } from '@/lib/types';
import { TIER_DETAILS } from '@/lib/constants';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';


const tierSettingSchema = z.object({
  questLimit: z.coerce.number().int().min(0, "Limit must be 0 or more.").nullable(),
  taskLimitPerQuest: z.coerce.number().int().min(1, "Task limit must be at least 1."),
});

const tierManagementSchema = z.object({
  bronze: tierSettingSchema,
  silver: tierSettingSchema,
  gold: tierSettingSchema,
  diamond: tierSettingSchema,
});

type FormValues = z.infer<typeof tierManagementSchema>;

const tierOrder: UserTier[] = ['bronze', 'silver', 'gold', 'diamond'];

export default function TierManagementPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(tierManagementSchema),
  });

  useEffect(() => {
    async function checkAdminStatusAndLoadData() {
      if (user) {
        const adminStatus = await isUserAdmin(user.uid);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          try {
            const settings = await getTierSettings();
            form.reset({
                bronze: { questLimit: settings.bronze.questLimit, taskLimitPerQuest: settings.bronze.taskLimitPerQuest },
                silver: { questLimit: settings.silver.questLimit, taskLimitPerQuest: settings.silver.taskLimitPerQuest },
                gold: { questLimit: settings.gold.questLimit, taskLimitPerQuest: settings.gold.taskLimitPerQuest },
                diamond: { questLimit: settings.diamond.questLimit, taskLimitPerQuest: settings.diamond.taskLimitPerQuest },
            });
          } catch (error) {
            console.error("Failed to load tier settings:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load tier settings.' });
          }
        }
        setIsLoadingData(false);
      }
    }
    checkAdminStatusAndLoadData();
  }, [user, form, toast]);

  const onSubmit = async (data: FormValues) => {
    try {
      const settingsToSave: TierSettings = {
        bronze: { questLimit: data.bronze.questLimit, taskLimitPerQuest: data.bronze.taskLimitPerQuest },
        silver: { questLimit: data.silver.questLimit, taskLimitPerQuest: data.silver.taskLimitPerQuest },
        gold: { questLimit: data.gold.questLimit, taskLimitPerQuest: data.gold.taskLimitPerQuest },
        diamond: { questLimit: data.diamond.questLimit, taskLimitPerQuest: data.diamond.taskLimitPerQuest },
      };
      await updateTierSettings(settingsToSave);
      toast({ title: 'Success!', description: 'Tier settings have been updated.' });
    } catch (error) {
      console.error("Failed to save tier settings:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
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
            <Settings />
            Tier Management
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 flex justify-center">
        <Card className="w-full max-w-4xl">
          <CardHeader>
            <CardTitle>Manage Tier Limits</CardTitle>
            <CardDescription>
              Set the maximum number of active quests and tasks per quest for each user tier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {tierOrder.map((tier) => {
                  const Icon = TIER_DETAILS[tier].icon;
                  return (
                    <FormItem key={tier} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4 gap-4">
                        <div className="space-y-1">
                          <FormLabel className="text-base flex items-center gap-2">
                            <Icon className={TIER_DETAILS[tier].color} />
                            <span className="capitalize">{TIER_DETAILS[tier].name}</span>
                          </FormLabel>
                          <FormDescription>
                            Configure the limits for the {TIER_DETAILS[tier].name} tier.
                          </FormDescription>
                        </div>
                        
                        <div className="flex items-start gap-x-6 gap-y-2 shrink-0 flex-wrap justify-end">
                             <FormField
                                control={form.control}
                                name={`${tier}.questLimit`}
                                render={({ field }) => {
                                    const isUnlimited = field.value === null;
                                    return (
                                    <div className="space-y-1">
                                        <FormLabel>Quest Limit</FormLabel>
                                        <div className="flex items-center gap-2">
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    className="w-20"
                                                    disabled={isUnlimited}
                                                    value={isUnlimited ? '' : field.value ?? 0}
                                                    onChange={(e) => field.onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                                                />
                                            </FormControl>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`${tier}-unlimited`}
                                                    checked={isUnlimited}
                                                    onCheckedChange={(checked) => field.onChange(checked ? null : 0)}
                                                />
                                                <Label htmlFor={`${tier}-unlimited`}>Unlimited</Label>
                                            </div>
                                        </div>
                                        <FormMessage className="text-xs" />
                                    </div>
                                    );
                                }}
                            />
                            
                            <FormField
                                control={form.control}
                                name={`${tier}.taskLimitPerQuest`}
                                render={({ field }) => (
                                    <div className="space-y-1">
                                        <FormLabel>Tasks / Quest</FormLabel>
                                        <FormControl>
                                             <Input
                                                type="number"
                                                className="w-20"
                                                value={field.value ?? 5}
                                                onChange={(e) => field.onChange(e.target.value === '' ? 1 : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs" />
                                    </div>
                                )}
                            />
                        </div>
                    </FormItem>
                  );
                })}
                <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                  {form.formState.isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Save className="mr-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
