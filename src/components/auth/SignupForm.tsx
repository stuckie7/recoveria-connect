
import React, { useState } from 'react';
import { supabase, ensureUserProfile } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

interface SignupFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const SignupForm: React.FC<SignupFormProps> = ({ loading, setLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Invalid password",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Create the user in auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Email already in use",
            description: "This email address is already registered",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign up failed",
            description: error.message || "An error occurred during sign up",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }
      
      // Explicitly create profile for the user to ensure it exists
      let profileSuccess = false;
      if (data?.user) {
        try {
          // Wait a longer time before trying to create the profile
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Retry profile creation multiple times if necessary
          for (let i = 0; i < 3; i++) {
            try {
              profileSuccess = await ensureUserProfile(data.user.id, data.user.email);
              if (profileSuccess) break;
              
              // Wait between retries
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
              console.error(`Profile creation attempt ${i+1} failed:`, err);
              // Continue with retries
            }
          }
          
          if (!profileSuccess) {
            console.warn("Failed to create profile after multiple attempts");
          }
        } catch (profileError) {
          console.error('Failed to create profile during signup:', profileError);
          // Continue signup flow despite profile creation errors
        }
      }
      
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link.",
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">
          Password must be at least 6 characters long
        </p>
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Creating account...' : 'Sign up'}
      </Button>
    </form>
  );
};
