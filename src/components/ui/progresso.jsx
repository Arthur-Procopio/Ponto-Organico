import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progresso = React.forwardRef(
  ({ className, value, indicatorClassName, ...props }, ref) => {
    const [animatedValue, setAnimatedValue] = React.useState(value || 0);
    const animationRef = React.useRef(null);
    const animatedValueRef = React.useRef(value || 0);
    const isInitialMount = React.useRef(true);

    React.useEffect(() => {
      animatedValueRef.current = animatedValue;
    }, [animatedValue]);

    React.useEffect(() => {
      const targetValue = value || 0;
      
      if (isInitialMount.current) {
        setAnimatedValue(targetValue);
        animatedValueRef.current = targetValue;
        isInitialMount.current = false;
        return;
      }
      
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      const currentAnimatedValue = animatedValueRef.current;
      if (Math.abs(targetValue - currentAnimatedValue) > 0.1) {
        const duration = 1500;
        const startValue = currentAnimatedValue;
        const difference = targetValue - startValue;
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          const easeOutCubic = 1 - Math.pow(1 - progress, 3);
          const currentValue = startValue + (difference * easeOutCubic);
          
          setAnimatedValue(currentValue);
          animatedValueRef.current = currentValue;

          if (progress < 1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setAnimatedValue(targetValue);
            animatedValueRef.current = targetValue;
            animationRef.current = null;
          }
        };

        animationRef.current = requestAnimationFrame(animate);
      }

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [value]);

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn("h-full w-full flex-1", indicatorClassName || "bg-primary")}
          style={{ transform: `translateX(-${100 - animatedValue}%)` }}
        />
      </ProgressPrimitive.Root>
    );
  }
);
Progresso.displayName = ProgressPrimitive.Root.displayName;

export { Progresso };
