'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
}

export function AnimatedCard({ children, className, delay = 0, hover = true }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
      className={cn(
        'rounded-xl border bg-card text-card-foreground shadow-sm',
        'backdrop-blur-sm bg-white/90 dark:bg-gray-900/90',
        'border-gray-200 dark:border-gray-800',
        className
      )}
    >
      {children}
    </motion.div>
  )
}