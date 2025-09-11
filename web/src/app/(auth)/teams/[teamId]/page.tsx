'use client'

import { useTeam } from '@/lib/hooks/use-teams'
import { useAuth } from '@/lib/auth/providers'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RoleGuard } from '@/components/auth/RoleGuard'
import {
    Users,
    FolderOpen,
    Edit,
    UserPlus,
    Calendar,
    MapPin
} from 'lucide-react'
import Link from 'next/link'
import { formatDateTime, formatTeamRole } from '@/lib/utils/formatters'
import { ROUTES } from '@/lib/utils/constants'
import { TEAM_ROLE_COLORS } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'

interface TeamDetailPageProps {
    params: {
        teamId: string
    }
}

export default function TeamDetailPage({ params }: TeamDetailPageProps) {
    const { teamId } = params
    const { data: team, isLoading, error } = useTeam(teamId)
    const { hasAnyRole } = useAuth()

    const canManageTeam = hasAnyRole(['admin', 'team-lead'])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Csapat" description="Csapat részletek betöltése..." />
                <LoadingSpinner size="lg" text="Csapat adatok betöltése..." />
            </div>
        )
    }

    if (error || !team) {
        return (
            <div className="space-y-6">
                <PageHeader title="Csapat" description="Hiba történt" />
                <div className="text-center text-red-600">
                    {error?.message || 'A csapat nem található'}
                </div>
            </div>
        )
    }

    const teamLeads = team.members.filter(member => member.role === 'lead')
    const teamMembers = team.members.filter(member => member.role === 'member')

    return (
        <div className="space-y-6">
            <PageHeader
                title={team.name}
                description={team.description || 'Csapat részletek és tagok kezelése'}
            >
                <div className="flex items-center space-x-2">
                    <RoleGuard roles={['admin', 'team-lead']}>
                        <Button asChild variant="outline">
                            <Link href={ROUTES.TEAM_MEMBERS(teamId)}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Tagok kezelése
                            </Link>
                        </Button>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Szerkesztés
                        </Button>
                    </RoleGuard>
                </div>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Team info */}
                <div className="md:col-span-2 space-y-6">
                    {/* Basic info card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Csapat információk</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-1">Leírás</h3>
                                <p className="text-muted-foreground">
                                    {team.description || 'Nincs leírás megadva.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium mb-1">Létrehozva</h4>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        {formatDateTime(team.createdAt)}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Utoljára módosítva</h4>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        {formatDateTime(team.updatedAt)}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 pt-2 border-t">
                                <div className="flex items-center space-x-1">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{team.members.length}</span>
                                    <span className="text-sm text-muted-foreground">tag</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{team.projectCount}</span>
                                    <span className="text-sm text-muted-foreground">projekt</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Team members preview */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-2">
                                    <Users className="h-5 w-5" />
                                    <span>Csapat tagjai ({team.members.length})</span>
                                </CardTitle>
                                <Button asChild variant="outline" size="sm">
                                    <Link href={ROUTES.TEAM_MEMBERS(teamId)}>
                                        Összes megtekintése
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {team.members.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-2 text-sm font-medium">Még nincsenek tagok</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Kezdj el tagokat hozzáadni ehhez a csapathoz.
                                    </p>
                                    <RoleGuard roles={['admin', 'team-lead']}>
                                        <Button asChild className="mt-4" size="sm">
                                            <Link href={ROUTES.TEAM_MEMBERS(teamId)}>
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Tag hozzáadása
                                            </Link>
                                        </Button>
                                    </RoleGuard>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Team leads */}
                                    {teamLeads.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2 flex items-center">
                                                Csapatvezetők
                                                <Badge variant="secondary" className="ml-2">
                                                    {teamLeads.length}
                                                </Badge>
                                            </h4>
                                            <div className="space-y-2">
                                                {teamLeads.slice(0, 3).map((member) => (
                                                    <div key={member.id} className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src="" alt={member.username} />
                                                            <AvatarFallback className="text-xs">
                                                                {member.firstName && member.lastName
                                                                    ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                                                                    : member.username.charAt(0).toUpperCase()
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {member.firstName && member.lastName
                                                                    ? `${member.firstName} ${member.lastName}`
                                                                    : member.username
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {member.email}
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant="outline"
                                                            className={cn(TEAM_ROLE_COLORS[member.role as keyof typeof TEAM_ROLE_COLORS])}
                                                        >
                                                            {formatTeamRole(member.role)}
                                                        </Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Team members */}
                                    {teamMembers.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-medium mb-2 flex items-center">
                                                Tagok
                                                <Badge variant="outline" className="ml-2">
                                                    {teamMembers.length}
                                                </Badge>
                                            </h4>
                                            <div className="space-y-2">
                                                {teamMembers.slice(0, 5).map((member) => (
                                                    <div key={member.id} className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage src="" alt={member.username} />
                                                            <AvatarFallback className="text-xs">
                                                                {member.firstName && member.lastName
                                                                    ? `${member.firstName.charAt(0)}${member.lastName.charAt(0)}`
                                                                    : member.username.charAt(0).toUpperCase()
                                                                }
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium truncate">
                                                                {member.firstName && member.lastName
                                                                    ? `${member.firstName} ${member.lastName}`
                                                                    : member.username
                                                                }
                                                            </p>
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {member.email}
                                                            </p>
                                                        </div>
                                                        <Badge variant="outline">
                                                            {formatTeamRole(member.role)}
                                                        </Badge>
                                                    </div>
                                                ))}
                                                {teamMembers.length > 5 && (
                                                    <p className="text-sm text-muted-foreground text-center pt-2">
                                                        és még {teamMembers.length - 5} tag...
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statisztikák</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Összes tag</span>
                                <Badge variant="outline">{team.members.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Vezetők</span>
                                <Badge variant="secondary">{teamLeads.length}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Projektek</span>
                                <Badge variant="outline">{team.projectCount}</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick actions */}
                    <RoleGuard roles={['admin', 'team-lead']}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Gyors műveletek</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={ROUTES.TEAM_MEMBERS(teamId)}>
                                        <UserPlus className="mr-2 h-4 w-4" />
                                        Tagok kezelése
                                    </Link>
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Csapat szerkesztése
                                </Button>
                                <Button className="w-full" variant="outline">
                                    <FolderOpen className="mr-2 h-4 w-4" />
                                    Új projekt
                                </Button>
                            </CardContent>
                        </Card>
                    </RoleGuard>
                </div>
            </div>
        </div>
    )
}