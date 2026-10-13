"use client";

import React, { useState, useEffect } from "react";
import { CaretCoordinates } from "@/types/typing.types";

interface CaretProps {
  coordinates: CaretCoordinates;
  isTyping: boolean;
}

export const Caret: React.FC<CaretProps> = ({ coordinates, isTyping }) => {
  const [isBreathing, setIsBreathing] = useState(false);

  // Transition to subtle breathing effect after 1.2s pause in keystrokes
  useEffect(() => {
    if (isTyping) {
      setIsBreathing(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsBreathing(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [isTyping, coordinates.x, coordinates.y]);

  if (!coordinates.visible) return null;

  return (
    <div
      aria-hidden="true"
      className={`absolute top-0 left-0 w-[2.5px] rounded-full pointer-events-none z-20 caret-smooth shadow-[0_0_10px_var(--typing-caret)] bg-[var(--typing-caret)] ${
        isBreathing
          ? "animate-caret-breathe"
          : !isTyping
          ? "animate-caret-breathe"
          : "opacity-100"
      }`}
      style={{
        top: 0,
        left: 0,
        transform: `translate3d(${coordinates.x}px, ${coordinates.y}px, 0)`,
        height: `${coordinates.height}px`,
        willChange: "transform",
      }}
    />
  );
};
