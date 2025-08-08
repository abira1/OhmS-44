import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import ErrorBoundary from "./components/ErrorBoundary";

// Safe logging function that won't cause module issues
const safeLog = (message: string) => {
  // Only log in development, and only if console is available
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && typeof console !== 'undefined') {
    console.info(message);
  }
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);

  // Signal that React is starting to mount (development only)
  safeLog('React starting to mount...');

  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );

  // Signal that React has started rendering (but may still be loading)
  setTimeout(() => {
    container.setAttribute('data-react-started', 'true');
    safeLog('React render initiated');
  }, 100);
}