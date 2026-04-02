import { cn } from '../../lib/utils'

export const NeonInput = ({ className, error, ...props }) => {
  return (
    <div className="relative group">
      <input
        className={cn(
          'w-full bg-black/60 border border-primary/30 rounded-sm',
          'px-4 py-3 text-primary font-mono text-sm',
          'placeholder:text-primary/25',
          'outline-none transition-all duration-300',
          'focus:border-primary focus:bg-black/80',
          'focus:shadow-[0_0_0_1px_rgba(0,255,65,0.3),0_0_20px_rgba(0,255,65,0.15)]',
          error && 'border-error/50 focus:border-error focus:shadow-[0_0_0_1px_rgba(255,68,68,0.3)]',
          className
        )}
        {...props}
      />
      {/* Animated bottom line on focus */}
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary via-accent to-primary group-focus-within:w-full transition-all duration-500 rounded-full" />
    </div>
  )
}
