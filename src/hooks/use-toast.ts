
import { toast as sonnerToast } from "sonner";

// Re-export the sonner toast for direct usage
export const toast = sonnerToast;

// For compatibility with existing code
export function useToast() {
  return {
    toast: sonnerToast
  };
}
