
'use client';

import { Download, ThumbsUp, User, Edit, Trash2 } from 'lucide-react';
import type { QuestPack } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuestPackCardProps {
  pack: QuestPack;
  isOwner: boolean;
  onAdd: () => void;
  onUpvote: () => void;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const QuestPackCard = ({ pack, isOwner, onAdd, onUpvote, onPreview, onEdit, onDelete }: QuestPackCardProps) => {
  return (
    <Card className="flex flex-col h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <CardTitle>{pack.title}</CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs">
          <User className="h-3 w-3" />
          by {pack.creatorNickname}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">{pack.description}</p>
        <div className="flex flex-wrap gap-1">
          {pack.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="capitalize">{tag}</Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex-col items-stretch space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Download className="h-4 w-4" />
            <span>{pack.downloads.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            <span>{pack.upvotes.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {isOwner ? (
            <>
              <Button variant="secondary" className="w-full" onClick={onEdit} disabled>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" className="w-full" onClick={onDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={onPreview}>Preview</Button>
              <Button onClick={onAdd} className="w-full">Add to My Quests</Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default QuestPackCard;
