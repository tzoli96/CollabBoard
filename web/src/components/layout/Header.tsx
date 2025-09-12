'use client'

import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { UserMenu } from './UserMenu'

export function Header() {
    const { toggleSidebar } = useUIStore()

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                {/* Mobile menu button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={toggleSidebar}
                >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                </Button>

                {/* Logo/Title */}
                <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-semibold">Team Dashboard</h1>
                </div>

                {/* User menu */}
                <div className="ml-auto">
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
