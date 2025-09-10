'use client'

import { cn } from '@/lib/utils'
import { useUIStore } from '@/lib/stores/ui-store'
import { Navigation } from './Navigation'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useUIStore()

    return (
        <>
            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/80 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:relative md:top-0 md:z-0 md:h-[calc(100vh-4rem)] md:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Mobile close button */}
                <div className="flex h-16 items-center justify-between px-4 md:hidden">
                    <h2 className="text-lg font-semibold">Navigáció</h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Navigation content */}
                <div className="flex h-full flex-col overflow-y-auto px-4 py-4">
                    <Navigation />
                </div>
            </aside>
        </>
    )
}