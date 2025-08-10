// src/main.tsx (FINAL, CORRECTED CODE)

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async'; // Step 1: Import the provider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider> {/* Step 2: Wrap your App component */}
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);