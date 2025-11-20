"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Check, X } from "lucide-react";

import { cn } from "./utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-300 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-5 w-[42px] shrink-0 items-center rounded-full border border-transparent transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 relative",
        className,
      )}
      {...props}
    >
      {/* Icons Container */}
      <span className="absolute inset-0 flex items-center justify-between px-[5px] pointer-events-none">
        {/* Check Icon (ON state) */}
        <Check
          className="h-[11px] w-[11px] text-white transition-opacity duration-100 data-[state=checked]:opacity-100 data-[state=unchecked]:opacity-0"
          data-state={props.checked ? 'checked' : 'unchecked'}
          strokeWidth={3}
        />
        {/* X Icon (OFF state) */}
        <X
          className="h-[11px] w-[11px] text-white transition-opacity duration-100 data-[state=checked]:opacity-0 data-[state=unchecked]:opacity-100"
          data-state={props.checked ? 'checked' : 'unchecked'}
          strokeWidth={3}
        />
      </span>
      
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-white pointer-events-none block h-[16px] w-[16px] rounded-full shadow-lg ring-0 data-[state=checked]:translate-x-[24px] data-[state=unchecked]:translate-x-[2px]",
        )}
        style={{
          border: props.checked ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid #d4d4d8',
          transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
