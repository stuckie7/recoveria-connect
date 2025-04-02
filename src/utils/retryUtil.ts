
/**
 * Utility for performing operations with automatic retry on failure
 */
export const performWithRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries = 3,
  initialDelay = 500
): Promise<T> => {
  let retries = 0;
  let lastError: Error | null = null;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      
      if (retries >= maxRetries) {
        break;
      }
      
      // Exponential backoff with jitter
      const delay = initialDelay * Math.pow(2, retries) * (0.8 + Math.random() * 0.4);
      console.log(`Retrying in ${Math.round(delay)}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should only be reached if all retries failed
  throw new Error(`Operation failed after ${maxRetries} attempts: ${lastError?.message}`);
};
