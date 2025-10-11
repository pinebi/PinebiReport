'use client'

import React from 'react'

// Code splitting utility
export function withCodeSplitting<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn)

  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => (
    <React.Suspense fallback={fallback ? <fallback /> : <div>Loading...</div>}>
      <LazyComponent ref={ref} {...props} />
    </React.Suspense>
  ))
}













