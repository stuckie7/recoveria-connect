
import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface SignupFormProps {
  setLoading: (loading: boolean) => void;
  loading: boolean;
}

export const SignupForm: React.FC<SignupFormProps> = ({ setLoading, loading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
      // Let Supabase handle email uniqueness constraints
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            email: email,
          }
        }
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
        console.error('Signup error:', error);
        setLoading(false);
        return;
      }
      
      toast({
        title: "Success!",
        description: "Check your email for the confirmation link, or login if verification is disabled.",
      });
      
      // Reset form
      setEmail('');
      setPassword('');
      setLoading(false);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred during sign up",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email-signup">Email</Label>
        <Input
          id="email-signup"
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="password-signup">Password</Label>
        <div className="relative">
          <Input
            id="password-signup"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Password must be at least 6 characters
        </p>
      </div>
      
      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Creating account..." : "Create Account"}
        {!loading && <UserPlus className="ml-2 h-4 w-4" />}
      </Button>
    </form>
  );
};
