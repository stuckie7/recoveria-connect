import React, { useState } from 'react';
import { supabase, ensureUserProfile } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ loading, setLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (userError) {
        if (userError.message.includes('Invalid login credentials')) {
          toast({
            title: "Invalid credentials",
            description: "The email or password you entered is incorrect",
            variant: "destructive",
          });
        } else if (userError.message.includes('Database error')) {
          toast({
            title: "Login Error",
            description: "We're experiencing technical difficulties. Please try again in a few moments.",
            variant: "destructive",
          });
          console.error("Database error during authentication:", userError.message);
        } else {
          toast({
            title: "Login failed",
            description: userError.message || "An error occurred during login",
            variant: "destructive",
          });
        }
        setLoading(false);
        return;
      }
      
      if (userData?.user) {
        try {
          console.log("Login successful, creating/checking profile...");
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          let profileSuccess = false;
          const maxAttempts = 3;
          
          for (let i = 0; i < maxAttempts; i++) {
            try {
              profileSuccess = await ensureUserProfile(userData.user.id, userData.user.email);
              if (profileSuccess) {
                console.log("Profile confirmed for user:", userData.user.id);
                break;
              }
              
              console.log(`Profile creation attempt ${i+1} didn't succeed, retrying...`);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (err) {
              console.error(`Profile creation attempt ${i+1} failed:`, err);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
          
          if (!profileSuccess) {
            console.warn("Failed to create profile after multiple attempts, but continuing login flow");
          }
          
          toast({
            title: "Success!",
            description: "You are now logged in",
          });
        } catch (profileError) {
          console.error('Error ensuring user profile exists:', profileError);
          toast({
            title: "Success!",
            description: "You are now logged in, but profile setup had issues",
          });
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
          </a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};
