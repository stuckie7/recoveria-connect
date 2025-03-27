
import React, { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PhoenixLogo } from './PhoenixLogo';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

export const AuthCard: React.FC = () => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full max-w-md">
      <PhoenixLogo />

      <div className="glass-card">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn size={16} />
              <span>Login</span>
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2">
              <UserPlus size={16} />
              <span>Sign up</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm loading={loading} setLoading={setLoading} />
          </TabsContent>
          
          <TabsContent value="signup">
            <SignupForm loading={loading} setLoading={setLoading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
