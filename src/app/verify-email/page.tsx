
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MailCheck, LogOut } from 'lucide-react';

export default function VerifyEmailPage() {
  const { user, signOut, resendVerificationEmail, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if user is verified, not logged in, or still loading
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.emailVerified) {
        router.push('/');
      }
    }
  }, [user, authLoading, router]);

  // Periodically check verification status
  useEffect(() => {
    const interval = setInterval(async () => {
      if (user) {
        await user.reload();
        if (user.emailVerified) {
          router.push('/');
        }
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [user, router]);
  
   // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    setIsSending(true);
    const result = await resendVerificationEmail();
    if (result.success) {
      toast({
        title: 'Email Sent!',
        description: 'A new verification email has been sent to your address.',
      });
      setResendCooldown(60); // 60-second cooldown
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to send verification email.',
      });
    }
    setIsSending(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (authLoading || !user || user.emailVerified) {
     return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="items-center text-center">
           <Link href="/" className="flex items-center gap-2 no-underline mb-4">
            <Image src="/img/logos/android-chrome-192x192.png" alt="LevelUp Life Logo" width={40} height={40} priority />
            <span className="text-3xl font-bold text-primary font-headline">LevelUp Life</span>
          </Link>
          <CardTitle className="text-2xl flex items-center gap-2"><MailCheck /> Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
                Please check your inbox at <br/> <span className="font-bold text-foreground">{user.email}</span> <br/> and click the link to activate your account.
            </p>
            <p className="text-xs text-muted-foreground">
                (Don't forget to check your spam folder!)
            </p>

            <Button onClick={handleResendEmail} disabled={isSending || resendCooldown > 0} className="w-full">
                {isSending ? (
                    <Loader2 className="animate-spin" />
                ) : resendCooldown > 0 ? (
                   `Resend in ${resendCooldown}s`
                ) : (
                    'Resend Verification Email'
                )}
            </Button>
            <Button variant="ghost" onClick={handleSignOut} className="w-full">
                <LogOut className="mr-2"/> Log Out
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
