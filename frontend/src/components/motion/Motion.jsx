/**
 * Reusable motion primitives built on the `motion` library.
 * Timings follow Pro Max guidance: enter 150-400ms, ease-out, staggered reveals,
 * transform/opacity only (no layout thrash). `motion` respects prefers-reduced-motion
 * when the user sets it via the useReducedMotion-aware variants below.
 */
import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.22, 1, 0.36, 1] // easeOutExpo-ish — natural deceleration

/** Fade + rise on mount. Use for section blocks. */
export function Reveal({ children, delay = 0, y = 14, className, ...props }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Container that staggers its direct <Stagger.Item> children. */
export function Stagger({ children, className, gap = 0.06, delay = 0.05, ...props }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

Stagger.Item = function StaggerItem({ children, className, y = 16, ...props }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : y },
        show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Springy hover/press for cards & tappable tiles (Pro Max: scale-feedback). */
export function Pressable({ children, className, lift = true, ...props }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { y: lift ? -3 : 0, scale: lift ? 1 : 1.01 }}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

/** Animated horizontal bar fill — width via scaleX (transform, no reflow). */
export function BarFill({ pct, className, delay = 0 }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: 'left' }}
      initial={{ scaleX: reduce ? 1 : 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
    >
      <div style={{ width: `${pct}%`, height: '100%' }} className="bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full" />
    </motion.div>
  )
}

export { motion }
