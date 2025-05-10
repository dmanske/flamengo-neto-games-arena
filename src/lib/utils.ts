
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Format currency in Brazilian Real
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

/**
 * A utility function that merges class names using clsx and tailwind-merge
 * This is used by shadcn UI components
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
