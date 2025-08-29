import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const ThumbSwitch = React.forwardRef(
  ({ className, thumbColor, borderColor, backgroundColor, trackColor, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        borderColor: borderColor || "black",
        backgroundColor: trackColor || backgroundColor || "white",
      }}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
        style={{ backgroundColor: thumbColor || "#FFFFFF" }}
      />
    </SwitchPrimitives.Root>
  )
);
ThumbSwitch.displayName = "ThumbSwitch";

export { ThumbSwitch };
