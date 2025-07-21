'use client';

import { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';

import { MOTIVATIONAL_QUOTES } from '@/lib/quotes';
import { Card, CardContent } from '@/components/ui/card';

export default function MotivationalQuote() {
  const [quote, setQuote] = useState<{ quote: string; author: string } | null>(null);

  useEffect(() => {
    // Select a random quote on the client side to avoid hydration mismatch
    const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  if (!quote) {
    return null;
  }

  return (
    <Card className="bg-accent/50 border-accent/20">
      <CardContent className="p-4 text-center">
        <Quote className="h-5 w-5 text-accent-foreground/50 mx-auto mb-2" />
        <p className="italic text-sm text-accent-foreground">"{quote.quote}"</p>
        <p className="text-xs text-accent-foreground/70 mt-2">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
