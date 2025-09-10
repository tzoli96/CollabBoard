import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
    text?: string
}

export function LoadingSpinner({
                                   size = 'md',
                                   className,
                                   text
                               }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
    }

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <div className="flex flex-col items-center space-y-2">
                <Loader2
                    className={cn(
                        'animate-spin text-muted-foreground',
                        sizeClasses[size]
                    )}
                />
                {text && (
                    <p className="text-sm text-muted-foreground">
                        {text}
                    </p>
                )}
            </div>
        </div>
    )
}
