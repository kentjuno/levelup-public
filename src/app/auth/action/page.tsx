'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { applyActionCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type ActionState = 'loading' | 'success' | 'error';

function AuthActionHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [status, setStatus] = useState<ActionState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleAction = async () => {
      if (!auth) {
        setErrorMessage('Firebase is not configured correctly.');
        setStatus('error');
        return;
      }

      const mode = searchParams.get('mode');
      const actionCode = searchParams.get('oobCode');

      if (!mode || !actionCode) {
        setErrorMessage('Invalid link. Required parameters are missing.');
        setStatus('error');
        return;
      }

      try {
        switch (mode) {
          case 'verifyEmail':
            await applyActionCode(auth, actionCode);
            setStatus('success');
            toast({
              title: 'Success!',
              description: 'Your email has been verified. You can now log in.',
            });
            setTimeout(() => router.push('/'), 3000); // Redirect to home after 3s
            break;
          // You can add 'resetPassword', 'recoverEmail' cases here in the future
          default:
            setErrorMessage(`Unsupported action mode: ${mode}`);
            setStatus('error');
        }
      } catch (error: any) {
        console.error('Firebase action error:', error);
        let message = 'The action link is invalid or has expired. Please try again.';
        if (error.code === 'auth/invalid-action-code') {
          message = 'The verification link is invalid or has expired. Please request a new one.';
        }
        setErrorMessage(message);
        setStatus('error');
      }
    };

    handleAction();
  }, [searchParams, router, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Processing Your Request</CardTitle>
          <CardDescription>Please wait a moment...</CardDescription>
        </CardHeader>
        <CardContent>
          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p>Verifying your email...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex flex-col items-center gap-4 text-green-600">
              <CheckCircle className="h-12 w-12" />
              <p className="font-semibold">Email Verified Successfully!</p>
              <p className="text-sm text-muted-foreground">Redirecting you to the dashboard...</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-4 text-destructive">
              <XCircle className="h-12 w-12" />
              <p className="font-semibold">Verification Failed</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button asChild className="mt-4">
                <Link href="/login">Back to Login</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


export default function AuthActionPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <AuthActionHandler />
        </Suspense>
    )
}
