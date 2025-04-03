const signOut = async () => {
  try {
    setLoading(true);
    // If there's a user, update their online status
    if (user) {
      await setUserOffline(user);
    }
    
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    
    // REMOVED: localStorage.removeItem('onboarding-completed');
    // This line was causing onboarding to reappear for returning users
    
  } catch (error) {
    console.error('Error signing out:', error);
    toast({
      title: "Error",
      description: "Failed to sign out. Please try again.",
      variant: "destructive",
    });
  } finally {
    setLoading(false);
  }
};
