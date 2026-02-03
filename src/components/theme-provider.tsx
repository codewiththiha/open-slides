/**
 * @file theme-provider.tsx
 * @description Wrapper for next-themes to handle light and dark mode in the application UI.
 * @offers
 * - ThemeProvider: Enables theme switching (light/dark/system) across the UI.
 * @flow
 * This component wraps the root application in `main.tsx`, providing theme context to all children.
 */
import { ThemeProvider as NextThemesProvider } from "next-themes"

import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
