
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';

export function useRequireAuth(redirectUrl = '/login') {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // If not logged in, redirect to login page
        router.push(redirectUrl);
      } else if (!user.emailVerified && pathname !== '/verify-email') {
        // If logged in but email is not verified, and not on the verification page,
        // redirect to the verification page.
        router.push('/verify-email');
      }
    }
  }, [user, loading, router, redirectUrl, pathname]);

  return { user, loading };
}
