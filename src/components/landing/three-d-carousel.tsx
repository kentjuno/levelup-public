
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Feature {
  title: string;
  description: string;
  imageUrl: string;
  aiHint: string;
}

interface ThreeDCarouselProps {
  features: Feature[];
}

export default function ThreeDCarousel({ features }: ThreeDCarouselProps) {
  const [currIndex, setCurrIndex] = useState(0);
  const [itemWidth, setItemWidth] = useState(275);
  const [itemHeight, setItemHeight] = useState(412.5);
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTime = 5000;

  const move = useCallback((index: number) => {
    let newIndex = index;
    if (index < 0) {
      newIndex = features.length - 1;
    } else if (index >= features.length) {
      newIndex = 0;
    }
    setCurrIndex(newIndex);
  }, [features.length]);

  const timer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setCurrIndex(prevIndex => (prevIndex + 1) % features.length);
    }, intervalTime);
  }, [features.length]);

  const prev = () => {
    move(currIndex - 1);
    timer();
  };

  const next = () => {
    move(currIndex + 1);
    timer();
  };
  
  const handleResize = useCallback(() => {
    const newWidth = Math.max(window.innerWidth * 0.25, 275);
    const newHeight = newWidth * 1.5; // Maintain aspect ratio
    setItemWidth(newWidth);
    setItemHeight(newHeight);
  }, []);

  useEffect(() => {
    handleResize();
    move(Math.floor(features.length / 2));
    timer();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  
  const sliderStyle = {
    width: `${itemWidth * features.length}px`,
    transform: `translate3d(${ (currIndex * -itemWidth) - (itemWidth/2) + (typeof window !== 'undefined' ? window.innerWidth / 2 : 0) }px, 0, 0)`,
  };
  
  const getBoxStyle = (index: number) => {
    if (index === currIndex) {
      return { transform: "perspective(1200px)" };
    }
    const rotation = index < currIndex ? 40 : -40;
    return { transform: `perspective(1200px) rotateY(${rotation}deg)` };
  };

  return (
    <div className="carousel-3d h-[600px] pt-12">
      <div className="carousel-3d-body">
        <div className="carousel-3d-slider" style={sliderStyle} ref={sliderRef}>
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "carousel-3d-slider-item",
                currIndex === index && "carousel__slider__item--active"
              )}
              style={{ width: `${itemWidth - 40}px`, height: `${itemHeight}px` }}
            >
              <div className="item-3d-frame" style={getBoxStyle(index)}>
                <div className="item-3d-frame-box item-3d-frame-box--front p-4">
                    <div className="w-full h-full overflow-hidden rounded-md">
                        <Image
                            src={feature.imageUrl}
                            alt={feature.title}
                            width={300}
                            height={450}
                            data-ai-hint={feature.aiHint}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <h3 className="mt-4 text-xl font-bold font-headline">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </div>
                <div className="item-3d-frame-box item-3d-frame-box--left" />
                <div className="item-3d-frame-box item-3d-frame-box--right" />
              </div>
            </div>
          ))}
        </div>
      </div>
       <div className="carousel-3d-prev">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={prev}>
              <ChevronLeft className="h-6 w-6" />
          </Button>
      </div>
      <div className="carousel-3d-next">
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12" onClick={next}>
              <ChevronRight className="h-6 w-6" />
          </Button>
      </div>
    </div>
  );
}
