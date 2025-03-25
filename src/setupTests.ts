
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
// This is needed because we're using Jest in a TypeScript environment
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
    
    // Add missing Jest types
    type DoneCallback = (error?: any) => void;
    class Mock<T = any, Y extends any[] = any> {
      mockReturnValue(value: T): this;
      mockImplementation(fn: (...args: Y) => T): this;
      mockResolvedValue(value: Awaited<T>): this;
    }
  }

  const describe: (name: string, fn: () => void) => void;
  const test: (name: string, fn: (done?: jest.DoneCallback) => void | Promise<any>) => void;
  const it: typeof test;
  const expect: any;
  const beforeEach: (fn: () => void) => void;
  const afterEach: (fn: () => void) => void;
  const beforeAll: (fn: () => void) => void;
  const afterAll: (fn: () => void) => void;
  const jest: {
    fn: <T = any>() => jest.Mock<T>;
    mock: (moduleName: string, factory?: any) => void;
    clearAllMocks: () => void;
  };
}

// Add any global test setup here
