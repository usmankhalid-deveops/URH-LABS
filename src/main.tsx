import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Gracefully catch and suppress benign WebSocket/HMR or network heartbeat rejections
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || String(reason || "");
  
  // Filter out benign HMR/Vite WebSocket or offline sync heartbeats
  if (
    message.includes('WebSocket') || 
    message.includes('websocket') || 
    message.includes('online') || 
    message.includes('offline') || 
    message.includes('connection')
  ) {
    console.warn("URH LABS: Suppressed benign connection event.", message);
    event.preventDefault(); // Prevents browser or framework-level error overlay
  }
});

// Also handle general error events for WebSockets
window.addEventListener('error', (event) => {
  const message = event.message || "";
  if (message.includes('WebSocket') || message.includes('websocket')) {
    console.warn("URH LABS: Suppressed benign WebSocket socket error.", message);
    event.preventDefault();
  }
}, true);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
