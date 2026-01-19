import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Since clsx and tailwind-merge are not installed, we use a simple fallback for now.
// If the user installs them later, we can uncomment the imports correctly.
// But wait, the previous code imported 'cn' expecting shadcn-like behavior.
// Let's implement a simple version.

export function cn(...inputs: (string | undefined | null | false)[]) {
    return inputs.filter(Boolean).join(" ");
}
