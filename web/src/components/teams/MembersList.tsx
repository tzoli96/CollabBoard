// src/components/teams/MembersList.tsx
'use client'

import { useState } from 'react'
import { useTeamMembers } from '@/lib/hooks/use-teams'
import { useAuth } from '@/lib/auth/providers'
import { TeamMemberCard } from './TeamMemberCard'
import { AddMemberDialog } from './AddMemberDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { UserPlus, Search, Users, Crown } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { TeamRole } from '@/types/team'

interface MembersListProps {
    teamId: string
    teamName?: string
}

export function MembersList({ teamId, teamName }: MembersListProps) {
    const { data: members, isLoading, error } = useTeamMembers(teamId)
    const { hasAnyRole } = useAuth()
    const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<TeamRole | 'all'>('all')

    const debouncedSearch = useDebounce(searchTerm, 300)
    const canManageMembers = hasAnyRole(['admin', 'team-lead'])

    const filteredMembers = members?.filter(member => {
        const matchesSearch =
            member.user.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            `${member.user.firstName || ''} ${member.user.lastName || ''}`.toLowerCase().includes(debouncedSearch.toLowerCase())

        const matchesRole = roleFilter === 'all' || member.role === roleFilter

        return matchesSearch && matchesRole
    })

    const memberStats = members ? {
        total: members.length,
        leads: members.filter(m => m.role === TeamRole.TEAM_LEAD).length,
        members: members.filter(m => m.role === TeamRole.MEMBER).length,
    } : { total: 0, leads: 0, members: 0 }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={`${teamName ? `${teamName} - ` : ''}Tagok`}
                    description="Csapat tagok kezelése és szerepkörök beállítása"
                />
                <LoadingSpinner size="lg" text="Tagok betöltése..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title={`${teamName ? `${teamName} - ` : ''}Tagok`}
                    description="Csapat tagok kezelése és szerepkörök beállítása"
                />
                <div className="text-center text-red-600">
                    Hiba történt a tagok betöltése során: {error.message}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={`${teamName ? `${teamName} - ` : ''}Tagok`}
                description="Csapat tagok kezelése és szerepkörök beállítása"
            >
                <RoleGuard roles={['admin', 'team-lead']}>
                    <Button onClick={() => setAddMemberDialogOpen(true)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Tag hozzáadása
                    </Button>
                </RoleGuard>
            </PageHeader>

            {/* Stats */}
            <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{memberStats.total} összes tag</span>
                    </Badge>
                    {memberStats.leads > 0 && (
                        <Badge variant="secondary" className="flex items-center space-x-1">
                            <Crown className="h-3 w-3" />
                            <span>{memberStats.leads} vezető</span>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Search and filters */}
            <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tagok keresése..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant={roleFilter === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRoleFilter('all')}
                    >
                        Összes
                    </Button>
                    <Button
                        variant={roleFilter === TeamRole.LEAD ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRoleFilter(TeamRole.LEAD)}
                    >
                        Vezetők
                    </Button>
                    <Button
                        variant={roleFilter === TeamRole.MEMBER ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRoleFilter(TeamRole.MEMBER)}
                    >
                        Tagok
                    </Button>
                </div>
            </div>

            {/* Members list */}
            {!filteredMembers || filteredMembers.length === 0 ? (
                <EmptyState
                    icon={Users}
                    title={debouncedSearch || roleFilter !== 'all' ? "Nincs találat" : "Még nincsenek tagok"}
                    description={
                        debouncedSearch || roleFilter !== 'all'
                            ? "Próbálj más keresési feltételt vagy szűrőt."
                            : "Kezdj el tagokat hozzáadni a csapathoz!"
                    }
                    action={
                        canManageMembers && !debouncedSearch && roleFilter === 'all'
                            ? {
                                label: "Első tag hozzáadása",
                                onClick: () => setAddMemberDialogOpen(true),
                            }
                            : undefined
                    }
                />
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.map((member) => (
                        <TeamMemberCard
                            key={member.id}
                            member={member}
                            teamId={teamId}
                            canManage={canManageMembers}
                        />
                    ))}
                </div>
            )}

            {/* Add member dialog */}
            <AddMemberDialog
                teamId={teamId}
                open={addMemberDialogOpen}
                onOpenChange={setAddMemberDialogOpen}
            />
        </div>
    )
}