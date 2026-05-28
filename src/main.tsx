import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent Vite dev overlay from crashing on Supabase network errors when mocking
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && (event.reason.message === 'Failed to fetch' || event.reason.toString().includes('Failed to fetch') || event.reason.toString().includes('fetch'))) {
    event.preventDefault();
  }
});

window.addEventListener('error', (event) => {
  if (event.message && (event.message === 'Failed to fetch' || event.message.includes('Failed to fetch') || event.message.includes('fetch'))) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
