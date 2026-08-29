"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

const MotionLink = motion(Link);

export default function AnimatedCard({
  children,
  index = 0,
  href,
  className = "",
}: {
  children: ReactNode;
  index?: number;
  href?: string;
  className?: string;
}) {
  const motionProps = {
    initial: { opacity: 0, y: 28, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: { duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] as const },
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
  };

  if (href) {
    return (
      <MotionLink href={href} className={`card-glow block ${className}`} {...motionProps}>
        {children}
      </MotionLink>
    );
  }

  return (
    <motion.div className={`card-glow ${className}`} {...motionProps}>
      {children}
    </motion.div>
  );
}
