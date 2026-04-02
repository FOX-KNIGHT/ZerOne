import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export const AnimatedButton = ({ children, className, variant = 'primary', type = 'button', disabled, onClick, ...props }) => {
  const variants = {
    primary: {
      base: 'bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-black',
      glow: '0 0 20px rgba(0,255,65,0.4)',
      hoverGlow: '0 0 35px rgba(0,255,65,0.7)',
    },
    danger: {
      base: 'bg-transparent border-2 border-error text-error hover:bg-error hover:text-black',
      glow: '0 0 20px rgba(255,68,68,0.3)',
      hoverGlow: '0 0 35px rgba(255,68,68,0.6)',
    },
    accent: {
      base: 'bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-black',
      glow: '0 0 20px rgba(0,242,255,0.3)',
      hoverGlow: '0 0 35px rgba(0,242,255,0.6)',
    },
    ghost: {
      base: 'bg-transparent border border-white/20 text-white/70 hover:border-primary/50 hover:text-primary',
      glow: 'none',
      hoverGlow: '0 0 15px rgba(0,255,65,0.2)',
    },
    gold: {
      base: 'bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black',
      glow: '0 0 20px rgba(255,215,0,0.3)',
      hoverGlow: '0 0 35px rgba(255,215,0,0.6)',
    },
  }

  const v = variants[variant] || variants.primary

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      whileHover={disabled ? {} : {
        boxShadow: v.hoverGlow,
        transition: { duration: 0.15 }
      }}
      className={cn(
        'relative inline-flex items-center justify-center gap-2',
        'px-6 py-3 font-mono font-bold uppercase tracking-widest text-sm',
        'transition-all duration-200 rounded-sm overflow-hidden',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        v.base,
        className
      )}
      style={{ boxShadow: disabled ? 'none' : v.glow }}
      {...props}
    >
      {/* Shimmer sweep on hover */}
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.08) 50%, transparent 65%)',
          backgroundSize: '200% 100%',
        }}
      />
      {/* Ripple dot indicator */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  )
}
