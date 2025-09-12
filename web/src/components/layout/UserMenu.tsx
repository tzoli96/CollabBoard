'use client'

import { useAuth } from '@/lib/auth/providers'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import {
    LogOut
} from 'lucide-react'
import { formatTeamRole } from '@/lib/utils/formatters'

export function UserMenu() {
    const { user, logout, hasRole, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        )
    }

    if (!user) {
        return null
    }

    const userInitials = user.firstName && user.lastName
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
        : user.username.charAt(0).toUpperCase()

    const displayName = user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.username

    const isAdmin = hasRole('admin')
    const isTeamLead = hasRole('team-lead')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={displayName} />
                        <AvatarFallback className="text-sm">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium leading-none">
                                {displayName}
                            </p>
                            {isAdmin && (
                                <Badge variant="destructive" className="text-xs">
                                    Admin
                                </Badge>
                            )}
                            {isTeamLead && !isAdmin && (
                                <Badge variant="secondary" className="text-xs">
                                    Team Lead
                                </Badge>
                            )}
                        </div>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {user.roles.slice(0, 3).map((role) => (
                                <Badge key={role} variant="outline" className="text-xs">
                                    {formatTeamRole(role)}
                                </Badge>
                            ))}
                            {user.roles.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                    +{user.roles.length - 3}
                                </Badge>
                            )}
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={logout}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Kijelentkezés</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}