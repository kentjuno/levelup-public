
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { WeeklyBoss } from '@/lib/types';

const HIT_IMAGES = ['/img/hits/hit1.png', '/img/hits/hit2.png'];

interface Hit {
  id: number;
  image: string;
  style: React.CSSProperties;
}

interface BossAttackSequenceProps {
  boss: WeeklyBoss;
  attackData: {
    dealtDamage: number;
    hitCount: number;
  };
  onComplete: () => void;
}

export default function BossAttackSequence({ boss, attackData, onComplete }: BossAttackSequenceProps) {
  const [hits, setHits] = useState<Hit[]>([]);
  const [displayDamage, setDisplayDamage] = useState(0);

  useEffect(() => {
    const { dealtDamage, hitCount } = attackData;
    if (dealtDamage <= 0 || hitCount <= 0) {
      onComplete();
      return;
    }

    const damagePerHit = Math.max(1, Math.floor(dealtDamage / hitCount));
    let totalAnimationTime = 500; // Initial delay for boss to appear
    let accumulatedDamage = 0;

    const timeouts: NodeJS.Timeout[] = [];

    for (let i = 0; i < hitCount; i++) {
      const isLastHit = i === hitCount - 1;
      const damageForThisHit = isLastHit
        ? dealtDamage - (damagePerHit * (hitCount - 1))
        : damagePerHit;
      
      accumulatedDamage += damageForThisHit;
      const finalAccumulatedDamage = accumulatedDamage;

      const randomDelay = Math.random() * (1400 - 700) + 700;
      totalAnimationTime += randomDelay;

      const hitTimeout = setTimeout(() => {
        new Audio('/sounds/hit.mp3').play().catch(e => console.error("Error playing sound:", e));
        setTimeout(() => new Audio('/sounds/boss-hurt.mp3').play().catch(e => console.error("Error playing sound:", e)), 150);

        setDisplayDamage(finalAccumulatedDamage);

        const newHit: Hit = {
          id: Math.random(),
          image: HIT_IMAGES[Math.floor(Math.random() * HIT_IMAGES.length)],
          style: {
            top: `${Math.random() * 60 + 20}%`, // Position vertically 20-80%
            left: `${Math.random() * 60 + 20}%`, // Position horizontally 20-80%
            transform: 'translate(-50%, -50%)',
          },
        };
        
        setHits(prev => [...prev, newHit]);
        
        // Remove the hit effect after it animates
        const removeTimeout = setTimeout(() => {
            setHits(prev => prev.filter(h => h.id !== newHit.id));
        }, 500);
        timeouts.push(removeTimeout);

      }, totalAnimationTime);
      timeouts.push(hitTimeout);
    }

    // End the sequence
    const finalTimeout = setTimeout(() => {
      onComplete();
    }, totalAnimationTime + 1000); // Add a final buffer
    timeouts.push(finalTimeout);

    // Cleanup function
    return () => {
      timeouts.forEach(clearTimeout);
    };

  }, [attackData, onComplete]);

  if (!boss.imageUrl) {
    // Should not happen if triggered correctly, but a good safeguard.
    onComplete();
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 animate-attack-overlay-in backdrop-blur-sm" />
      
      {/* Boss Container */}
      <div className="relative h-2/3 w-2/3 animate-attack-boss-zoom-in">
        <Image
          src={boss.imageUrl}
          alt={boss.title}
          fill
          className="object-contain [filter:drop-shadow(0_1px_2px_rgba(0,0,0,0.5))_drop-shadow(0_0_8px_#fff)]"
          unoptimized
        />

        {/* Hit Effects now inside the boss container */}
        {hits.map(hit => (
          <div key={hit.id} className="absolute pointer-events-none" style={hit.style}>
              <div className="relative animate-hit-effect-pop">
                  <Image
                      src={hit.image}
                      alt="hit effect"
                      width={200}
                      height={200}
                      unoptimized
                  />
              </div>
          </div>
        ))}
      </div>
      
       {/* Damage Display */}
       {displayDamage > 0 && (
         <div className="absolute bottom-[10%] text-center text-white animate-in fade-in-50 slide-in-from-bottom-10 duration-500">
            <h2 className="text-6xl font-bold" style={{ textShadow: '3px 3px 6px #000' }}>
                -{displayDamage.toLocaleString()}
            </h2>
        </div>
       )}

    </div>
  );
}
