'use client'

import { Button } from '@/components/ui/button'
import { Menu, Bell, Search } from 'lucide-react'
import { useUIStore } from '@/lib/stores/ui-store'
import { UserMenu } from './UserMenu'
import { Input } from '@/components/ui/input'

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

                {/* Search bar - desktop only */}
                <div className="ml-auto flex items-center space-x-4">
                    <div className="hidden md:flex">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Keresés..."
                                className="w-64 pl-8"
                            />
                        </div>
                    </div>

                    {/* Notifications */}
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              3
            </span>
                        <span className="sr-only">Notifications</span>
                    </Button>

                    {/* User menu */}
                    <UserMenu />
                </div>
            </div>
        </header>
    )
}
