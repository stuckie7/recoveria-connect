
// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => {
      return store[key] || null;
    },
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Add global Jest type declarations to avoid TypeScript errors
// Instead of redeclaring globally, we'll use module augmentation
// which is safer and won't conflict with existing declarations
declare global {
  interface Window {
    localStorage: typeof localStorageMock;
  }
}

// Add any global test setup here
