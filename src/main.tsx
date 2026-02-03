/**
 * @file main.tsx
 * @description The entry point of the React application.
 * @offers
 * - React DOM root initialization.
 * - Global CSS imports.
 * - ThemeProvider setup for light/dark mode support.
 * @flow
 * This file boots the React app, wraps it in necessary providers, and mounts it to the DOM.
 */
import { StrictMode } from 'react'

import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './components/theme-provider'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
