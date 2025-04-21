
import React, { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AuthGuard: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (location.pathname !== "/auth") {
        navigate("/auth", { replace: true });
      }
    } else {
      // If user tries to visit /auth while authenticated, go to /
      if (location.pathname === "/auth") {
        navigate("/", { replace: true });
      }
    }
  }, [user, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return <Outlet />;
};

export default AuthGuard;
