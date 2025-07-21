
import Link from 'next/link';
import { ArrowLeft, GitCommit, Zap, Wrench, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { changelogs } from '@/lib/changelog';
import type { ChangeType } from '@/lib/changelog';
import { cn } from '@/lib/utils';

const changeTypeDetails: Record<ChangeType, { icon: React.ElementType, text: string, className: string }> = {
  new: { icon: Zap, text: "New", className: "bg-green-500/10 text-green-700 border-green-500/20" },
  improvement: { icon: CheckCircle, text: "Improvement", className: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  fix: { icon: Wrench, text: "Fix", className: "bg-orange-500/10 text-orange-700 border-orange-500/20" },
};

export default function ChangelogPage() {
  return (
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
            <GitCommit />
            Changelog
          </h1>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6 max-w-3xl space-y-8">
        {changelogs.map((log) => (
          <Card key={log.version}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{log.title}</CardTitle>
                  <CardDescription>
                    Version {log.version} &bull; Released on {new Date(log.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {log.changes.map((change, index) => {
                  const details = changeTypeDetails[change.type];
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Badge variant="outline" className={cn("mt-1 shrink-0", details.className)}>
                         <details.icon className="h-3 w-3 mr-1" />
                         {details.text}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{change.description}</p>
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </main>
    </div>
  );
}
