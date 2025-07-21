
'use client';

import Image from 'next/image';
import ReactConfetti from 'react-confetti';

import type { Quest, Achievement, WeeklyBoss } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import BossAttackSequence from './boss-attack-sequence';

interface DashboardModalsProps {
    showConfetti: boolean;
    onConfettiComplete: (confetti: any) => void;
    windowSize: { width: number; height: number };
    levelUpInfo: { newLevel: number } | null;
    onCloseLevelUp: () => void;
    unlockedAchievement: Achievement | null;
    onCloseAchievement: () => void;
    questToDelete: Quest | undefined;
    onCancelDelete: () => void;
    onConfirmDelete: () => void;
    attackAnimationData: { dealtDamage: number; hitCount: number; } | null;
    weeklyBoss: WeeklyBoss | null;
    onAttackAnimationComplete: () => void;
    isClient: boolean;
}

export default function DashboardModals({
    showConfetti,
    onConfettiComplete,
    windowSize,
    levelUpInfo,
    onCloseLevelUp,
    unlockedAchievement,
    onCloseAchievement,
    questToDelete,
    onCancelDelete,
    onConfirmDelete,
    attackAnimationData,
    weeklyBoss,
    onAttackAnimationComplete,
    isClient,
}: DashboardModalsProps) {

  return (
    <>
      {/* Level Up Modal */}
      <Dialog open={showConfetti && !!levelUpInfo} onOpenChange={onCloseLevelUp}>
        <DialogContent>
          <DialogHeader className="items-center">
            <DialogTitle className="text-3xl text-primary font-bold">Level Up!</DialogTitle>
            <Image src="/img/illustrations/level-up.png" alt="Level Up!" width={200} height={200} data-ai-hint="level up" />
            <p className="text-5xl font-bold py-4">{levelUpInfo?.newLevel}</p>
            <p className="text-lg text-muted-foreground">You've reached a new level of awesome!</p>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      
      {/* Achievement Unlocked Modal */}
      <Dialog open={showConfetti && !!unlockedAchievement} onOpenChange={onCloseAchievement}>
        <DialogContent>
          <DialogHeader className="items-center">
            <DialogTitle className="text-2xl text-primary font-bold">Achievement Unlocked!</DialogTitle>
            {unlockedAchievement && (
              <>
                <Image src={unlockedAchievement.imageUrl} alt={unlockedAchievement.name} width={128} height={128} data-ai-hint={unlockedAchievement.aiHint} className="my-4 rounded-full" />
                <p className="text-xl font-bold">{unlockedAchievement.name}</p>
                <p className="text-muted-foreground text-center">{unlockedAchievement.description}</p>
              </>
            )}
          </DialogHeader>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!questToDelete} onOpenChange={onCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the quest "{questToDelete?.title}". If this quest was completed, any bonus XP will be deducted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={onCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Boss Attack Sequence */}
      {isClient && attackAnimationData && weeklyBoss && (
        <BossAttackSequence
          boss={weeklyBoss}
          attackData={attackAnimationData}
          onComplete={onAttackAnimationComplete}
        />
      )}

      {/* Confetti Effect */}
      {isClient && showConfetti && (
        <ReactConfetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          onConfettiComplete={onConfettiComplete}
        />
      )}
    </>
  );
}
