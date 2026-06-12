/**
 * `cn`: merge conditional class names and de-dupe conflicting Tailwind
 * utilities (the last one wins). Used by every UI primitive.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
