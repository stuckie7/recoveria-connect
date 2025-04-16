
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Error handling to debug production issues
const handleRenderError = (error: any) => {
  console.error('Rendering error occurred:', error);
  
  // Create a fallback UI for production errors
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="font-family: system-ui; padding: 2rem; max-width: 500px; margin: 0 auto; text-align: center;">
        <h2 style="color: #555;">Application Error</h2>
        <p>We're experiencing technical difficulties. Please refresh the page or try again later.</p>
        <button onclick="window.location.reload()" style="background: #3B82F6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Refresh Page</button>
      </div>
    `;
  }
};

// Add global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Debug information
console.log('App starting. Environment:', import.meta.env.MODE);
console.log('Current URL:', window.location.href);
console.log('Browser information:', navigator.userAgent);

try {
  // Create root and render the app
  const root = createRoot(document.getElementById("root")!);
  root.render(<App />);
} catch (error) {
  handleRenderError(error);
}
