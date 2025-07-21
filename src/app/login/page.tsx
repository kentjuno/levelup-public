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

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, isFirebaseConfigured } = useAuth();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    const result = await signIn(data.email, data.password);

    if (result && 'code' in result) {
      const authError = result as AuthError;
      let description = 'An unexpected error occurred. Please try again.';

      switch (authError.code) {
        case 'auth/invalid-credential':
          description = 'Invalid email or password. Please try again.';
          break;
        case 'auth/invalid-api-key':
        case 'auth/configuration-not-found':
          description = 'Your Firebase configuration is invalid. Please check your .env file.';
          break;
        case 'auth/operation-not-allowed':
          description = 'Email/password sign-in is not enabled. Please check your Firebase project settings.';
          break;
        default:
          description = `An unexpected error occurred: ${authError.code}. Please try again.`;
          break;
      }
      
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: description,
      });
    } else {
      router.push('/');
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
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
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
              <Input id="password" type="password" {...register('password')} autoComplete="current-password" disabled={!isFirebaseConfigured} />
               {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !isFirebaseConfigured}>
               {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Login
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
