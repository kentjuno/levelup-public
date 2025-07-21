'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';

// This layout will apply to all pages under /admin
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If auth is loaded and there's no user, useRequireAuth will redirect.
  // So, we only render the children if there is a user.
  if (!user) {
    // useRequireAuth handles the redirect, so we can return null here to avoid
    // a brief flash of content.
    return null;
  }

  return <>{children}</>;
}
