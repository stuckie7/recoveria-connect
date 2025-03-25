
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Create root without wrapping in StrictMode (now done in App.tsx)
createRoot(document.getElementById("root")!).render(<App />);
