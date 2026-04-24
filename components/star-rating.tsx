'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const handleClick = (rating: number) => {
    if (!disabled && onChange) {
      onChange(rating)
    }
  }

  const displayValue = hoverValue || value

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          disabled={disabled}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !disabled && setHoverValue(rating)}
          onMouseLeave={() => setHoverValue(0)}
          className={cn(
            'transition-transform',
            !disabled && 'hover:scale-110 cursor-pointer',
            disabled && 'cursor-default'
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              'transition-colors',
              rating <= displayValue
                ? 'text-accent fill-accent'
                : 'text-muted-foreground/30'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value > 0 ? value.toFixed(1) : '-'}
        </span>
      )}
    </div>
  )
}
