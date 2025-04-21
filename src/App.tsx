import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import EmergencySupport from "./components/EmergencySupport";
import PrivateRoute from "./components/PrivateRoute";
import OnboardingGuard from "./components/OnboardingGuard";
import WelcomePage from "./pages/welcome/WelcomePage";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Resources from "./pages/Resources";
import Profile from "./pages/Profile";
import Journal from "./pages/Journal";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import RefreshButton from "./components/RefreshButton";
import AuthGuard from "./components/AuthGuard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const isCustomDomain = window.location.hostname !== "recoveria-connect.lovable.app" && 
                      !window.location.hostname.includes("lovableproject.com");

const getBasename = () => {
  console.log("Current hostname:", window.location.hostname);
  return isCustomDomain ? "/" : "/";
};

const App = () => (
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={getBasename()}>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/auth" element={<Auth />} />
                  <Route element={<AuthGuard />}>
                    <Route path="/welcome" element={<WelcomePage />} />
                    <Route path="/404" element={<NotFound />} />
                    
                    <Route element={<OnboardingGuard />}>
                      <Route element={<PrivateRoute />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/resources" element={<Resources />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/journal" element={<Journal />} />
                      </Route>
                    </Route>
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Route>
                </Routes>
              </main>
              <EmergencySupport />
              <RefreshButton />
            </div>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </React.StrictMode>
);

export default App;
