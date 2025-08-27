
"use client"

// This is a stub file for the hook.
// You can add your own implementation here.
import { useAppStore } from "@/store/useAppStore"

export function useToast() {
    const addToast = useAppStore(state => state.addToast);
    return { toast: addToast };
}
