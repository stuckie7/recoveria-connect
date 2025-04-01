
/**
 * Utility for performing operations with automatic retry on failure
 */
export const performWithRetry = async <T>(
  operation: () => Promise<T>, 
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error);
      retries++;
      
      if (retries >= maxRetries) {
        throw new Error(`Operation failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
    }
  }

  // This should never be reached due to the throw above, but TypeScript needs it
  throw new Error("Unexpected execution path in retry utility");
};
