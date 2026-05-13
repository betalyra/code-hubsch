"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "focus-ring peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors after:absolute after:-inset-x-3 after:-inset-y-2 aria-invalid:outline-destructive data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7 data-[state=checked]:bg-accent-pink data-[state=unchecked]:bg-input hover:data-[state=checked]:bg-accent-pink-strong data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block rounded-full shadow-sm ring-0 transition-[transform,background-color] group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[state=checked]/switch:translate-x-full group-data-[state=checked]/switch:bg-background group-data-[state=unchecked]/switch:translate-x-0 group-data-[state=unchecked]/switch:bg-foreground/85 group-hover/switch:group-data-[state=unchecked]/switch:bg-accent-pink"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
