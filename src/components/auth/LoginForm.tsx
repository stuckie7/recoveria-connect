if (error) {
  if (error.message.includes('Email not confirmed')) {
    toast({
      title: "Email not confirmed",
      description: "Please check your email to confirm your account",
      variant: "destructive",
    });
  } else if (error.message.includes('Invalid login credentials')) {
    toast({
      title: "Invalid credentials",
      description: "The email or password you entered is incorrect",
      variant: "destructive",
    });
  } else if (error.message.includes('Database error')) {
    toast({
      title: "Authentication Error",
      description: "We're experiencing technical difficulties. Please try again in a few moments.",
      variant: "destructive",
    });
    console.error("Database error during authentication:", error.message);
  } else {
    toast({
      title: "Login failed",
      description: error.message || "An error occurred during login",
      variant: "destructive",
    });
  }
  return;  // Return instead of throwing
}
