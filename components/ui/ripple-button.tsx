'use client'

import { useUIAnimations } from '@/hooks/use-ui-animations'

interface RippleButtonProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function RippleButton({ 
  children, 
  className = '',
  onClick
}: RippleButtonProps) {
  const { useRipple } = useUIAnimations()
  const { handleClick, rippleStyle } = useRipple()

  return (
    <button
      onClick={(e) => {
        handleClick(e)
        if (onClick) onClick()
      }}
      className={`relative overflow-hidden transition-all duration-200 ${className}`}
    >
      {children}
      <div
        className="absolute inset-0 pointer-events-none"
        style={rippleStyle}
      />
    </button>
  )
}






