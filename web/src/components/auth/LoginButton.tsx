'use client'

import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/providers'
import { LogIn } from 'lucide-react'

interface LoginButtonProps {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LoginButton({ variant = 'default', size = 'md', className }: LoginButtonProps) {
    const { login, isLoading } = useAuth()

    return (
        <Button
            onClick={login}
            disabled={isLoading}
            variant={variant}
            size={size}
            className={className}
        >
            <LogIn className="mr-2 h-4 w-4" />
            Bejelentkezés
        </Button>
    )
}