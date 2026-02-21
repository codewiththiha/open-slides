/**
 * @file main.tsx
 * @description The entry point of the React application.
 * @offers
 * - React DOM root initialization.
 * - Global CSS imports.
 * - ThemeProvider setup for light/dark mode support.
 * - BrowserRouter for routing between pages.
 * @flow
 * This file boots the React app, wraps it in necessary providers, and mounts it to the DOM.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './components/theme-provider'
import { Dashboard } from './components/Dashboard'
import { Editor } from './components/Editor'
import { Settings } from './components/Settings'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/editor/:projectId" element={<Editor />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
