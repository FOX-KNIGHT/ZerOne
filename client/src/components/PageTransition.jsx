import { motion } from 'framer-motion'

const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(8px)',
  },
  in: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
  },
  out: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(8px)',
  },
}

const pageTransition = {
  type: 'spring',
  stiffness: 120,
  damping: 20,
  mass: 0.8,
}

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className={`min-h-screen w-full ${className}`}
    >
      {children}
    </motion.div>
  )
}
