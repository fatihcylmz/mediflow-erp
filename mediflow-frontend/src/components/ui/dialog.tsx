import * as React from "react"
import { cn } from "@/lib/utils"

export const Dialog = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)} {...props}>
    {children}
  </div>
)

export const DialogContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4", className)} {...props}>
    {children}
  </div>
)
