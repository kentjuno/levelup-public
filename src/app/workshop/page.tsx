
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Blocks, Search, Flame, Sparkles, Star, PlusCircle, User } from 'lucide-react';

import { useAuth } from '@/context/auth-context';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import type { QuestPack } from '@/lib/types';
import QuestPackCard from '@/components/workshop/quest-pack-card';
import { getQuestPacks, deleteQuestPack } from '@/services/firestoreService';
import { useToast } from '@/hooks/use-toast';
import QuestPackPreviewDialog from '@/components/workshop/QuestPackPreviewDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


export default function WorkshopPage() {
  useRequireAuth();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadingMyPacks, setLoadingMyPacks] = useState(false);
  const [questPacks, setQuestPacks] = useState<QuestPack[]>([]);
  const [myPacks, setMyPacks] = useState<QuestPack[]>([]);
  const [activeTab, setActiveTab] = useState<'newest' | 'popular' | 'trending' | 'my-packs'>('newest');
  const [selectedPack, setSelectedPack] = useState<QuestPack | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [packToDelete, setPackToDelete] = useState<QuestPack | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPacks = async () => {
      if (activeTab === 'my-packs') {
        if (!user) return;
        setLoadingMyPacks(true);
        try {
          const packs = await getQuestPacks({ sortBy: 'user', userId: user.uid });
          setMyPacks(packs);
        } catch (error) {
          console.error("Failed to fetch user's quest packs:", error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: "Could not load your quest packs.",
          });
        } finally {
          setLoadingMyPacks(false);
        }
      } else {
        setLoading(true);
        try {
            const packs = await getQuestPacks({ sortBy: activeTab });
            setQuestPacks(packs);
        } catch (error) {
            console.error("Failed to fetch quest packs:", error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not load quest packs from the workshop.',
            });
        } finally {
            setLoading(false);
        }
      }
    };
    fetchPacks();
  }, [activeTab, toast, user]);

  const handleAddPack = (packId: string) => {
    console.log(`Adding pack ${packId} to user's quests`);
  };

  const handleUpvotePack = (packId: string) => {
    console.log(`Upvoting pack ${packId}`);
  };

  const handlePreviewPack = (pack: QuestPack) => {
    setSelectedPack(pack);
    setIsPreviewOpen(true);
  };
  
  const handleDeleteRequest = (pack: QuestPack) => {
    setPackToDelete(pack);
  };

  const handleConfirmDelete = async () => {
    if (!packToDelete || !user) return;
    try {
        await deleteQuestPack(packToDelete.id, user.uid);
        setMyPacks(prev => prev.filter(p => p.id !== packToDelete.id));
        toast({ title: 'Pack Deleted', description: `"${packToDelete.title}" has been removed.` });
    } catch (error) {
        console.error("Failed to delete quest pack:", error);
        toast({ variant: 'destructive', title: 'Error', description: (error as Error).message || 'Could not delete your quest pack.' });
    } finally {
        setPackToDelete(null);
    }
  };
  
  const packsToDisplay = activeTab === 'my-packs' ? myPacks : questPacks;
  const isLoading = activeTab === 'my-packs' ? loadingMyPacks : loading;

  return (
    <>
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
                      <Blocks />
                      Workshop
                  </h1>
                  <Button asChild>
                    <Link href="/workshop/create">
                      <PlusCircle className="mr-2" />
                      Create Pack
                    </Link>
                  </Button>
              </div>
          </header>

          <main className="container mx-auto p-4 md:p-6">
              <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Search for quest packs..." className="pl-10" />
                      </div>
                      <Tabs 
                          value={activeTab} 
                          className="w-full sm:w-auto"
                          onValueChange={(value) => setActiveTab(value as any)}
                      >
                          <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full sm:w-auto">
                              <TabsTrigger value="trending"><Flame className="mr-2" /> Trending</TabsTrigger>
                              <TabsTrigger value="newest"><Sparkles className="mr-2" /> Newest</TabsTrigger>
                              <TabsTrigger value="popular"><Star className="mr-2" /> Popular</TabsTrigger>
                              <TabsTrigger value="my-packs"><User className="mr-2" /> My Packs</TabsTrigger>
                          </TabsList>
                      </Tabs>
                  </div>
                  
                  {isLoading ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {Array.from({ length: 6 }).map((_, i) => (
                             <Skeleton key={i} className="h-64 rounded-lg" />
                          ))}
                      </div>
                  ) : (
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {packsToDisplay.length > 0 ? packsToDisplay.map(pack => (
                              <QuestPackCard
                                  key={pack.id}
                                  pack={pack}
                                  isOwner={user?.uid === pack.creatorId}
                                  onAdd={() => handleAddPack(pack.id)}
                                  onUpvote={() => handleUpvotePack(pack.id)}
                                  onPreview={() => handlePreviewPack(pack)}
                                  onEdit={() => {}} // TODO: Implement edit functionality
                                  onDelete={() => handleDeleteRequest(pack)}
                              />
                          )) : (
                            <div className="col-span-full text-center py-16 text-muted-foreground">
                                <p>No quest packs found in this category yet.</p>
                                {activeTab !== 'my-packs' && <p>Why not be the first to create one?</p>}
                            </div>
                          )}
                      </div>
                  )}

              </div>
          </main>
      </div>
      <QuestPackPreviewDialog
        pack={selectedPack}
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onAddPack={handleAddPack}
      />
       <AlertDialog open={!!packToDelete} onOpenChange={(isOpen) => !isOpen && setPackToDelete(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                    This action will permanently delete the quest pack "{packToDelete?.title}". This cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}
