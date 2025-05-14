
import { toast as sonnerToast, ToastOptions } from "sonner";

// Export the sonner toast directly
export const toast = sonnerToast;

// For compatibility with existing code patterns
export function useToast() {
  return {
    toast: sonnerToast
  };
}
