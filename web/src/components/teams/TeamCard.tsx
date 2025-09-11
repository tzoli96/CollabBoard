// src/components/teams/TeamCard.tsx
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Team } from '@/types/team'
import { useAuth } from '@/lib/auth/providers'
import { useDeleteTeam } from '@/lib/hooks/use-teams'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { RoleGuard } from '@/components/auth/RoleGuard'
import {
    Users,
    FolderOpen,
    MoreVertical,
    Edit,
    Trash2,
    UserPlus,
    Eye
} from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/formatters'
import { ROUTES } from '@/lib/utils/constants'

interface TeamCardProps {
    team: Team
}

export function TeamCard({ team }: TeamCardProps) {
    const { hasAnyRole } = useAuth()
    const deleteTeamMutation = useDeleteTeam()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const canManageTeam = hasAnyRole(['admin', 'team-lead'])

    const handleDelete = async () => {
        try {
            await deleteTeamMutation.mutateAsync(team.id)
            setDeleteDialogOpen(false)
        } catch (error) {
            console.error('Failed to delete team:', error)
        }
    }

    // Get first few members for preview
    const memberPreviews = team.members.slice(0, 3)
    const remainingMembersCount = Math.max(0, team.members.length - 3)

    return (
        <>
            <Card className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle className="text-lg">
                                <Link
                                    href={ROUTES.TEAM_DETAIL(team.id)}
                                    className="hover:underline"
                                >
                                    {team.name}
                                </Link>
                            </CardTitle>
                            {team.description && (
                                <CardDescription className="line-clamp-2">
                                    {team.description}
                                </CardDescription>
                            )}
                        </div>

                        <RoleGuard
                            roles={['admin', 'team-lead']}
                            fallback={null}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Team opciók</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={ROUTES.TEAM_DETAIL(team.id)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Megtekintés
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href={ROUTES.TEAM_MEMBERS(team.id)}>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Tagok kezelése
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Szerkesztés
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => setDeleteDialogOpen(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Törlés
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </RoleGuard>
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{team.members.length} tag</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FolderOpen className="h-4 w-4" />
                            <span>{team.projectCount} projekt</span>
                        </div>
                    </div>

                    {/* Members preview */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Tagok</span>
                            {team.members.length > 0 && (
                                <Link
                                    href={ROUTES.TEAM_MEMBERS(team.id)}
                                    className="text-xs text-muted-foreground hover:underline"
                                >
                                    Összes megtekintése
                                </Link>
                            )}
                        </div>

                        {team.members.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Még nincsenek tagok</p>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <div className="flex -space-x-2">
                                    {memberPreviews.map((member) => (
                                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                                            <AvatarImage src="" alt={member.username} />
                                            <AvatarFallback className="text-xs">
                                                {member.firstName && member.lastName
                                                    ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                                                    : member.username.charAt(0).toUpperCase()
                                                }
                                            </AvatarFallback>
                                        </Avatar>
                                    ))}
                                </div>

                                {remainingMembersCount > 0 && (
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        +{remainingMembersCount}
                                    </div>
                                )}

                                {/* Team lead badge */}
                                {team.members.some(m => m.role === 'lead') && (
                                    <Badge variant="secondary" className="text-xs">
                                        Lead
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(team.updatedAt)}
            </span>
                        <Button asChild size="sm" variant="outline">
                            <Link href={ROUTES.TEAM_DETAIL(team.id)}>
                                Megnyitás
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Delete confirmation dialog */}
            <ConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title="Csapat törlése"
                description={`Biztosan törölni szeretnéd a "${team.name}" csapatot? Ez a művelet nem vonható vissza.`}
                confirmText="Törlés"
                cancelText="Mégse"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    )
}