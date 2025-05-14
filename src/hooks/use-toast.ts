
import * as React from "react";
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";

export type ToastProps = React.ComponentPropsWithoutRef<typeof SonnerToast>;

export function useToast() {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
    error: sonnerToast.error,
    success: sonnerToast.success,
    loading: sonnerToast.loading,
    promise: sonnerToast.promise,
    custom: sonnerToast,
  };
}

export { sonnerToast as toast };
