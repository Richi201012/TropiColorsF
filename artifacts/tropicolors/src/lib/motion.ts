import type { Transition, Variants } from "framer-motion";

export const MOTION_EASE_OUT: [number, number, number, number] = [
  0.16, 1, 0.3, 1,
];

export const MOTION_EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

export const MOTION_SPRING = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.72,
} satisfies Transition;

export const PANEL_SPRING = {
  type: "spring",
  stiffness: 360,
  damping: 34,
  mass: 0.82,
} satisfies Transition;

export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 16, scale: 0.985 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.985 },
} satisfies Variants;
