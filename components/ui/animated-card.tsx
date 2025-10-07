'use client'

import { useUIAnimations } from '@/hooks/use-ui-animations'

interface AnimatedCardProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function AnimatedCard({ 
  children, 
  delay = 0,
  className = ''
}: AnimatedCardProps) {
  const { useFadeIn } = useUIAnimations()
  const { elementRef, animationStyle } = useFadeIn({ duration: 800 })

  return (
    <div
      ref={elementRef}
      className={`transform transition-all duration-700 ease-out ${className}`}
      style={{
        ...animationStyle,
        transitionDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  )
}






