// src/components/teams/TeamMemberCard.tsx
'use client'

import { useState } from 'react'
import { TeamMember, TeamRole } from '@/types/team'
import { useUpdateMemberRole, useRemoveMember } from '@/lib/hooks/use-teams'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
import {
    MoreVertical,
    Crown,
    User,
    UserMinus,
    Mail,
    Calendar
} from 'lucide-react'
import { formatRelativeTime, formatTeamRole } from '@/lib/utils/formatters'
import { TEAM_ROLE_COLORS } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'

interface TeamMemberCardProps {
    member: TeamMember
    teamId: string
    canManage: boolean
}

export function TeamMemberCard({ member, teamId, canManage }: TeamMemberCardProps) {
    const updateRoleMutation = useUpdateMemberRole(teamId)
    const removeMemberMutation = useRemoveMember(teamId)

    const [removeDialogOpen, setRemoveDialogOpen] = useState(false)

    const displayName = member.user.firstName && member.user.lastName
        ? `${member.user.firstName} ${member.user.lastName}`
        : member.user.email
    console.log(member)

    const userInitials = member.user.firstName && member.user.lastName
        ? `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`
        : member.user.email?.charAt(0)?.toUpperCase() || '?'

    const handleRoleChange = async (newRole: TeamRole) => {
        if (newRole === member.role) return

        try {
            await updateRoleMutation.mutateAsync({
                userId: member.userId,
                data: { role: newRole }
            })
        } catch (error) {
            console.error('Failed to update member role:', error)
        }
    }

    const handleRemove = async () => {
        try {
            await removeMemberMutation.mutateAsync(member.userId)
            setRemoveDialogOpen(false)
        } catch (error) {
            console.error('Failed to remove member:', error)
        }
    }

    return (
        <>
            <Card className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="" alt={displayName} />
                                <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <h3 className="font-medium leading-none">{displayName}</h3>
                                <p className="text-sm text-muted-foreground">@{member.user.email}</p>
                            </div>
                        </div>

                        {canManage && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                        <span className="sr-only">Tag opciók</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => handleRoleChange(TeamRole.TEAM_LEAD)}
                                        disabled={member.role === TeamRole.TEAM_LEAD}
                                    >
                                        <Crown className="mr-2 h-4 w-4" />
                                        Vezetővé előléptetés
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() => handleRoleChange(TeamRole.MEMBER)}
                                        disabled={member.role === TeamRole.MEMBER}
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        Taggá lefokozás
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600"
                                        onClick={() => setRemoveDialogOpen(true)}
                                    >
                                        <UserMinus className="mr-2 h-4 w-4" />
                                        Eltávolítás
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Role badge */}
                    <div className="flex items-center justify-between">
                        <Badge
                            variant="outline"
                            className={cn(TEAM_ROLE_COLORS[member.role as keyof typeof TEAM_ROLE_COLORS])}
                        >
                            {(member.role === TeamRole.TEAM_LEAD || member.role === TeamRole.ADMIN) && <Crown className="mr-1 h-3 w-3" />}
                            {formatTeamRole(member.role)}
                        </Badge>
                    </div>

                    {/* Contact info */}
                    <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{member.user.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Csatlakozott {formatRelativeTime(member.joinedAt)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Remove confirmation dialog */}
            <ConfirmDialog
                open={removeDialogOpen}
                onOpenChange={setRemoveDialogOpen}
                title="Tag eltávolítása"
                description={`Biztosan el szeretnéd távolítani ${displayName} felhasználót a csapatból?`}
                confirmText="Eltávolítás"
                cancelText="Mégse"
                variant="destructive"
                onConfirm={handleRemove}
            />
        </>
    )
}