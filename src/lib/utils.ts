/**
 * @file utils.ts
 * @description Common utility functions for styling and component logic.
 * @offers
 * - cn(): A utility for merging Tailwind CSS classes with clsx and tailwind-merge.
 * @flow
 * Components use `cn()` to conditionally apply styles and resolve Tailwind class conflicts.
 */
import { clsx, type ClassValue } from "clsx"

import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
