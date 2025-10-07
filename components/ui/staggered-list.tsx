'use client'

import { useUIAnimations } from '@/hooks/use-ui-animations'

interface StaggeredListProps {
  items: any[]
  renderItem: (item: any, index: number) => React.ReactNode
  className?: string
}

export function StaggeredList({ 
  items, 
  renderItem,
  className = ''
}: StaggeredListProps) {
  const { useStagger } = useUIAnimations()
  const { elementRefs, getItemStyle } = useStagger(items.length, 150)

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div
          key={index}
          ref={el => elementRefs.current[index] = el}
          style={getItemStyle(index)}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  )
}






