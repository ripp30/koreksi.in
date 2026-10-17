import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn("min-h-36 w-full resize-y rounded-2xl border-0 bg-white px-5 py-4 text-base text-black outline-none placeholder:text-neutral-400 focus:ring-2 focus:ring-brand-dark", className)} {...props} />
  )
);
Textarea.displayName = "Textarea";
