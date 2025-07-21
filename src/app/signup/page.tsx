
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Terminal } from 'lucide-react';
import { AuthError } from 'firebase/auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { isValidInvitationCode } from '@/services/firestoreService';


const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long.' }),
  invitationCode: z.string().min(1, { message: 'Invitation code is required.' }),
});

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signUp, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setLoading(true);

    const codeIsValid = await isValidInvitationCode(data.invitationCode);
    if (!codeIsValid) {
        toast({
            variant: 'destructive',
            title: 'Invalid Invitation Code',
            description: "The invitation code you entered is not valid. Please check and try again.",
        });
        setLoading(false);
        return;
    }

    const result = await signUp(data.email, data.password);

    if (result && 'code' in result) {
      const authError = result as AuthError;
      let description = 'An unexpected error occurred. Please try again.';

      switch (authError.code) {
        case 'auth/email-already-in-use':
          description = 'This email is already in use. Please try another one or sign in.';
          break;
        case 'auth/weak-password':
          description = 'The password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          description = 'The email address is not valid. Please check and try again.';
          break;
        case 'auth/operation-not-allowed':
          description = 'Email/password sign-up is not enabled. Please check your Firebase project settings.';
          break;
        case 'auth/invalid-api-key':
        case 'auth/configuration-not-found':
            description = 'Your Firebase configuration is invalid. Please check your .env file.';
            break;
        default:
          description = `An unknown error occurred: ${authError.code}. Please check your Firebase configuration and try again.`;
          break;
      }

      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description,
      });
    } else {
      router.push('/verify-email');
      toast({
        title: 'Account Created!',
        description: "Please check your email to verify your account.",
      });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader className="items-center text-center">
          <Link href="/" className="flex items-center gap-2 no-underline mb-4">
            <Image src="/img/logos/android-chrome-192x192.png" alt="LevelUp Life Logo" width={40} height={40} priority />
            <span className="text-3xl font-bold text-primary font-headline">LevelUp Life</span>
          </Link>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your details below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isFirebaseConfigured && (
            <Alert variant="destructive" className="mb-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Firebase Not Configured</AlertTitle>
              <AlertDescription>
                Please add your Firebase project credentials to the <code>.env</code> file to enable authentication.
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
                autoComplete="email"
                disabled={!isFirebaseConfigured}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register('password')} autoComplete="new-password" disabled={!isFirebaseConfigured} />
              {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="invitationCode">Invitation Code</Label>
              <Input
                id="invitationCode"
                type="text"
                placeholder="ABCDEF12"
                {...register('invitationCode')}
                autoComplete="off"
                disabled={!isFirebaseConfigured}
              />
              {errors.invitationCode && <p className="text-sm text-destructive">{errors.invitationCode.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !isFirebaseConfigured}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign Up
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
