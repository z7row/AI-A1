"use client";

import type { Variants } from "framer-motion";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: -18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 18 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export const staggerList = (
  delay = 0.06,
  initial = 0.05,
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: delay, delayChildren: initial },
  },
});

export const cardHover = {
  scale: 1.01,
  y: -2,
  transition: {
    duration: 0.2,
    ease: [0.25, 0.46, 0.45, 0.94] as const,
  },
};