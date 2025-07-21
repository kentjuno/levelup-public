'use client';

import type { WeeklyBoss, UserBossContribution } from '@/lib/types';
import WeeklyBossCard from './weekly-boss-card';
import FlavorQuestCard from './flavor-quest-card';

interface BossViewProps {
  weeklyBoss: WeeklyBoss;
  bossContribution: UserBossContribution | null;
  pendingDamage: number;
  pendingHitCount: number;
  isAttacking: boolean;
  onAttack: () => Promise<void>;
  isClaimable: boolean;
  isClaiming: boolean;
  onClaimRewards: () => void;
  onCompleteFlavorTask: (taskId: string, damage: number) => void;
  currentEnergy: number;
  maxEnergy: number;
  lastEnergyRefill: string | null;
}

const BossView = ({
  weeklyBoss,
  bossContribution,
  pendingDamage,
  pendingHitCount,
  isAttacking,
  onAttack,
  isClaimable,
  isClaiming,
  onClaimRewards,
  onCompleteFlavorTask,
  currentEnergy,
  maxEnergy,
  lastEnergyRefill,
}: BossViewProps) => {
  return (
    <div className="space-y-4">
      <WeeklyBossCard
        boss={weeklyBoss}
        contribution={bossContribution}
        pendingDamage={pendingDamage}
        pendingHitCount={pendingHitCount}
        isAttacking={isAttacking}
        onAttack={onAttack}
        isClaimable={isClaimable}
        isClaiming={isClaiming}
        onClaimRewards={onClaimRewards}
        currentEnergy={currentEnergy}
        maxEnergy={maxEnergy}
        lastEnergyRefill={lastEnergyRefill}
      />
      {weeklyBoss.flavorQuest && (
        <FlavorQuestCard
          quest={weeklyBoss.flavorQuest}
          completedTasks={bossContribution?.completedFlavorTasks ?? []}
          onToggleTask={onCompleteFlavorTask}
        />
      )}
    </div>
  );
};

export default BossView;
