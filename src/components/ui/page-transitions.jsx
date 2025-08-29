import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export const PageTransition = ({
  children,
  isActive,
  transitionType = "fade",
  duration = 300,
  className,
}) => {
  const [shouldRender, setShouldRender] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration]);

  const getTransitionClasses = () => {
    switch (transitionType) {
      case "fade":
        return isActive ? "opacity-100" : "opacity-0";
      case "slide":
        return isActive ? "translate-x-0" : "-translate-x-full";
      case "zoom":
        return isActive ? "scale-100 opacity-100" : "scale-95 opacity-0";
      default:
        return isActive ? "opacity-100" : "opacity-0";
    }
  };

  if (!shouldRender && !isActive) {
    return null;
  }

  return (
    <div
      className={cn("transition-all", getTransitionClasses(), className)}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  );
};

export const FadeTransition = ({
  children,
  isActive,
  duration = 200,
  className,
}) => {
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (isActive) {
      setDisplayChildren(children);
    }
  }, [children, isActive]);

  return (
    <div
      className={cn(
        "transition-opacity w-full h-full",
        isActive ? "opacity-100" : "opacity-0",
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {displayChildren}
    </div>
  );
};

export const SlideTransition = ({
  children,
  isActive,
  duration = 300,
  className,
}) => {
  return (
    <PageTransition
      isActive={isActive}
      transitionType="slide"
      duration={duration}
      className={className}
    >
      {children}
    </PageTransition>
  );
};

export const ZoomTransition = ({
  children,
  isActive,
  duration = 300,
  className,
}) => {
  return (
    <PageTransition
      isActive={isActive}
      transitionType="zoom"
      duration={duration}
      className={className}
    >
      {children}
    </PageTransition>
  );
};
