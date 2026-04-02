import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

export const GlassCard = ({ children, className, hover = false, variant = 'terminal', ...props }) => {
  const variants = {
    terminal: 'bg-black/70 border-primary/30 shadow-[0_0_20px_rgba(0,255,65,0.06),inset_0_1px_0_rgba(0,255,65,0.04)]',
    hologram: 'bg-black/50 border-transparent shadow-[0_0_30px_rgba(0,255,65,0.1),0_0_60px_rgba(0,242,255,0.05)]',
    danger: 'bg-black/70 border-error/30 shadow-[0_0_20px_rgba(255,68,68,0.1)]',
    gold: 'bg-black/70 border-gold/30 shadow-[0_0_20px_rgba(255,215,0,0.1)]',
    accent: 'bg-black/70 border-accent/30 shadow-[0_0_20px_rgba(0,242,255,0.08)]',
  }

  const hoverGlow = {
    terminal: { backgroundColor: 'rgba(0,255,65,0.04)', borderColor: 'rgba(0,255,65,0.5)', boxShadow: '0 0 30px rgba(0,255,65,0.15)' },
    hologram: { borderColor: 'rgba(0,242,255,0.4)', boxShadow: '0 0 40px rgba(0,242,255,0.15)' },
    danger: { borderColor: 'rgba(255,68,68,0.5)', boxShadow: '0 0 30px rgba(255,68,68,0.2)' },
    gold: { borderColor: 'rgba(255,215,0,0.5)', boxShadow: '0 0 30px rgba(255,215,0,0.2)' },
    accent: { borderColor: 'rgba(0,242,255,0.5)', boxShadow: '0 0 30px rgba(0,242,255,0.15)' },
  }

  return (
    <motion.div
      whileHover={hover ? { scale: 1.015, ...hoverGlow[variant] } : {}}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative overflow-hidden border rounded-xl p-6 backdrop-blur-md',
        variant === 'hologram' ? 'hologram-card' : '',
        variants[variant],
        hover && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {/* Corner Brackets — animated */}
      <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/60 rounded-tl-sm transition-all duration-300 group-hover:w-6 group-hover:h-6" />
      <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/60 rounded-tr-sm transition-all duration-300" />
      <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/60 rounded-bl-sm transition-all duration-300" />
      <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary/60 rounded-br-sm transition-all duration-300" />

      {/* Hologram shimmer overlay */}
      {variant === 'hologram' && (
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(0,255,65,0.15) 50%, transparent 60%)',
            animation: 'shimmer 4s linear infinite',
            backgroundSize: '200% 100%',
          }}
        />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  )
}
