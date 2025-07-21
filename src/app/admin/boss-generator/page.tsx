
'use client';

import { useState, type ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2, Upload, ClipboardCopy, CalendarIcon } from 'lucide-react';
import { generateWeeklyBoss, WeeklyBossAiOutput } from '@/ai/flows/generate-weekly-boss';
import { setWeeklyBoss } from '@/services/firestoreService';
import { getWeekId } from '@/lib/bosses';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';


export default function BossGeneratorPage() {
  const [loading, setLoading] = useState(false);
  const [generatedBoss, setGeneratedBoss] = useState<(WeeklyBossAiOutput & { imageUrl?: string }) | null>(null);
  const [deadline, setDeadline] = useState<Date>();
  const { toast } = useToast();

  // Helper function to process images (resize and check size)
  const processImageUri = (dataUri: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = document.createElement('img');
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Could not get canvas context to process the image.'));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to WebP format for superior compression, even with transparency.
            const newUri = canvas.toDataURL('image/webp', 0.8);
            
            if (newUri.length > 400 * 1024) { // 400KB limit for the data URI
                reject(new Error('Processed image is still too large after compression. Please use a smaller or less complex image.'));
                return;
            }

            resolve(newUri);
        };
        img.onerror = () => {
            reject(new Error('Could not load the image data. It might be corrupt.'));
        };
        img.src = dataUri;
    });
  };

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedBoss(null);
    try {
      const boss = await generateWeeklyBoss();
      setGeneratedBoss(boss);
      toast({
        title: "Boss Generated!",
        description: `Say hello to "${boss.title}"`,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: "Generation Failed",
        description: "Could not generate a weekly boss. Please check the console.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload an image file (PNG, JPG, etc.).' });
        return;
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit before processing
        toast({ variant: 'destructive', title: 'Image Too Large', description: 'Please upload an image smaller than 10MB.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        if (e.target?.result) {
            try {
                const processedUri = await processImageUri(e.target.result as string);
                setGeneratedBoss((prev) => prev ? { ...prev, imageUrl: processedUri } : null);
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : 'Could not process the uploaded image.';
                 toast({ variant: 'destructive', title: 'Processing Failed', description: errorMessage });
            }
        }
    };
    reader.onerror = () => {
        toast({ variant: 'destructive', title: 'Read Error', description: 'Could not read the selected file.' });
    };
    reader.readAsDataURL(file);
  };
  
  const uploadBossImage = async (weekId: string, dataUri: string): Promise<string> => {
    if (!storage) throw new Error("Firebase Storage is not configured.");
    const imageRef = storageRef(storage, `boss-images/${weekId}.webp`);
    await uploadString(imageRef, dataUri, 'data_url');
    const downloadURL = await getDownloadURL(imageRef);
    return downloadURL;
  }

  const handleSetAsWeeklyBoss = async () => {
    if (!generatedBoss) return;
    setLoading(true);
    try {
      const weekId = getWeekId(new Date());
      
      let finalImageUrl = generatedBoss.imageUrl;

      if (finalImageUrl && finalImageUrl.startsWith('data:image')) {
        finalImageUrl = await uploadBossImage(weekId, finalImageUrl);
      }
      
      if (!finalImageUrl) {
        toast({
            variant: 'destructive',
            title: "Image Required",
            description: "An image must be uploaded before setting the boss.",
        });
        setLoading(false);
        return;
      }
      
      const bossToSet = { ...generatedBoss, imageUrl: finalImageUrl };
      await setWeeklyBoss(weekId, bossToSet, deadline);
      
      toast({
        title: "Weekly Boss is Live!",
        description: `"${generatedBoss.title}" is now the boss for week ${weekId}.`,
      });

    } catch (error) {
       console.error(error);
      toast({
        variant: 'destructive',
        title: "Failed to Set Boss",
        description: "Could not set the weekly boss in Firestore. Check console for details.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    if (!generatedBoss) return;
    const prompt = `A menacing, fantasy-style boss monster for a video game, sticker style, vector art. The boss should have a transparent background. Style: digital painting, epic, detailed. Description: ${generatedBoss.description}`;
    navigator.clipboard.writeText(prompt);
    toast({
      title: 'Prompt Copied!',
      description: 'The suggestion has been copied to your clipboard.',
    });
  };

  const promptSuggestion = generatedBoss 
    ? `A menacing, fantasy-style boss monster for a video game, sticker style, vector art. The boss should have a transparent background. Style: digital painting, epic, detailed. Description: ${generatedBoss.description}`
    : "";

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Weekly Boss Generator</CardTitle>
          <CardDescription>
            Generate a new boss, get a prompt, and set it live.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="mr-2" />}
            Generate New Boss
          </Button>

          {generatedBoss && (
            <Card className="p-4 bg-muted">
              <h3 className="font-bold text-lg">{generatedBoss.title}</h3>
              <p className="text-sm text-muted-foreground">{generatedBoss.description}</p>
              <p className="text-sm mt-2">Total HP: {generatedBoss.totalHp}</p>
              <div className="mt-2 text-sm border-t pt-2">
                <h4 className="font-semibold">Flavor Quest: {generatedBoss.flavorQuest.title}</h4>
                <p className="text-xs text-muted-foreground">{generatedBoss.flavorQuest.description}</p>
                 <ul className="list-disc pl-5 mt-2 text-xs">
                    {generatedBoss.flavorQuest.tasks.map((task, i) => <li key={task.id || i}>{task.text}</li>)}
                </ul>
              </div>

              <Card className="mt-4 bg-background">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Image Prompt Suggestion</CardTitle>
                  <CardDescription className="text-xs">
                    Copy this prompt and use it in your favorite AI image generator.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea readOnly value={promptSuggestion} className="text-xs h-24" />
                  <Button variant="outline" size="sm" className="mt-2" onClick={handleCopyPrompt}>
                    <ClipboardCopy className="mr-2" />
                    Copy Prompt
                  </Button>
                </CardContent>
              </Card>

              <div className="mt-4 space-y-2">
                <Label htmlFor="boss-image" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Boss Image
                </Label>
                <Input id="boss-image" type="file" accept="image/*" onChange={handleImageUpload} />
              </div>
              
               {generatedBoss.imageUrl && (
                <div className="mt-4 relative aspect-video">
                    <Image
                        src={generatedBoss.imageUrl}
                        alt="Boss Image Preview"
                        fill
                        className="rounded-md object-contain"
                        unoptimized
                    />
                </div>
            )}
              
              <div className="mt-4 space-y-2">
                  <Label htmlFor="deadline-picker">Custom Deadline (for Testing)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={'outline'}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deadline && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={deadline}
                        onSelect={setDeadline}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    If unset, deadline will default to the end of the current week.
                  </p>
              </div>

              <Button onClick={handleSetAsWeeklyBoss} disabled={loading || !generatedBoss.imageUrl} className="w-full mt-4">
                Set as Current Week's Boss
              </Button>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
