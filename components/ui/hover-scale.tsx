'use client'

import { useState, useRef, useEffect } from 'react'

interface HoverScaleProps {
  children: React.ReactNode
  scale?: number
  className?: string
}

export function HoverScale({ 
  children, 
  scale = 1.05,
  className = ''
}: HoverScaleProps) {
  const [isHovered, setIsHovered] = useState(false)
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = divRef.current
    if (!element) return

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => setIsHovered(false)

    element.addEventListener('mouseenter', handleMouseEnter)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div 
      ref={divRef}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: isHovered ? `scale(${scale})` : 'scale(1)'
      }}
    >
      {children}
    </div>
  )
}
