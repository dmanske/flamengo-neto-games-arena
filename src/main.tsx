
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from "sonner"; // Import Toaster from sonner directly

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Toaster position="top-right" />
  </>
);
