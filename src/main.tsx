
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './contexts/AppContext'; 
import App from './App.tsx';
import './index.css';

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
