'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/providers'
import {
    LayoutDashboard,
    Users,
    FolderOpen
} from 'lucide-react'
import { ROUTES } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface NavItem {
    title: string
    href: string
    icon: React.ComponentType<{ className?: string }>
    roles?: string[]
    badge?: string | number
}

const navItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: ROUTES.DASHBOARD,
        icon: LayoutDashboard,
    },
    {
        title: 'Csapatok',
        href: ROUTES.TEAMS,
        icon: Users,
    },
    {
        title: 'Projektek',
        href: ROUTES.PROJECTS,
        icon: FolderOpen,
    },
]

export function Navigation() {
    const pathname = usePathname()
    const { hasAnyRole } = useAuth()

    const filteredNavItems = navItems.filter(item => {
        if (!item.roles) return true
        return hasAnyRole(item.roles)
    })

    return (
        <nav className="space-y-2">
            <div className="space-y-1">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon

                    return (
                        <Button
                            key={item.href}
                            asChild
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                                'w-full justify-start',
                                isActive && 'bg-secondary text-secondary-foreground'
                            )}
                        >
                            <Link href={item.href}>
                                <Icon className="mr-2 h-4 w-4" />
                                {item.title}
                                {item.badge && (
                                    <Badge variant="secondary" className="ml-auto">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        </Button>
                    )
                })}
            </div>

        </nav>
    )
}