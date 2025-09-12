'use client'

import { useProject } from '@/lib/hooks/use-projects'
import { useAuth } from '@/lib/auth/providers'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { RoleGuard } from '@/components/auth/RoleGuard'
import {
    Edit,
    Calendar,
    Users,
    Clock,
    AlertTriangle,
    CheckCircle,
    Play,
    Pause,
    RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { formatDateTime, formatProjectStatus, formatRelativeTime } from '@/lib/utils/formatters'
import { PROJECT_STATUS_COLORS } from '@/lib/utils/constants'
import { ROUTES } from '@/lib/utils/constants'
import { ProjectStatus } from '@/types/project'
import { cn } from '@/lib/utils'

interface ProjectDetailPageProps {
    params: {
        projectId: string
    }
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
    const { projectId } = params
    const { data: project, isLoading, error } = useProject(projectId)
    const { hasAnyRole } = useAuth()

    const canManageProject = hasAnyRole(['admin', 'team-lead'])

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Projekt" description="Projekt részletek betöltése..." />
                <LoadingSpinner size="lg" text="Projekt adatok betöltése..." />
            </div>
        )
    }

    if (error || !project) {
        return (
            <div className="space-y-6">
                <PageHeader title="Projekt" description="Hiba történt" />
                <div className="text-center text-red-600">
                    {error?.message || 'A projekt nem található'}
                </div>
            </div>
        )
    }

    const isOverdue = project.deadline && new Date(project.deadline) < new Date() &&
        project.status !== ProjectStatus.COMPLETED

    const deadlineStatus = project.deadline ? {
        date: new Date(project.deadline),
        isOverdue,
        daysUntil: Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    } : null

    const progressValue =
        project.status === ProjectStatus.COMPLETED ? 100 :
            project.status === ProjectStatus.REVIEW ? 80 :
                project.status === ProjectStatus.IN_PROGRESS ? 50 :
                    project.status === ProjectStatus.PLANNING ? 20 :
                        0

    const getStatusIcon = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.COMPLETED:
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case ProjectStatus.IN_PROGRESS:
                return <Play className="h-5 w-5 text-blue-600" />
            case ProjectStatus.ON_HOLD:
                return <Pause className="h-5 w-5 text-red-600" />
            case ProjectStatus.REVIEW:
                return <RotateCcw className="h-5 w-5 text-yellow-600" />
            default:
                return <Clock className="h-5 w-5 text-gray-600" />
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={project.title}
                description={project.description || 'Projekt részletek és állapot követés'}
            >
                <div className="flex items-center space-x-2">
                    <RoleGuard roles={['admin', 'team-lead']}>
                        <Button>
                            <Edit className="mr-2 h-4 w-4" />
                            Szerkesztés
                        </Button>
                    </RoleGuard>
                </div>
            </PageHeader>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Status card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                {getStatusIcon(project.status)}
                                <span>Projekt állapot</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "text-sm px-3 py-1",
                                        PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS]
                                    )}
                                >
                                    {formatProjectStatus(project.status)}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                  {progressValue}% kész
                </span>
                            </div>

                            <Progress value={progressValue} className="w-full" />

                            <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                                <div>
                                    <h4 className="font-medium mb-1">Utolsó frissítés</h4>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Clock className="mr-1 h-4 w-4" />
                                        {formatRelativeTime(project.updatedAt)}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-medium mb-1">Létrehozva</h4>
                                    <p className="text-sm text-muted-foreground flex items-center">
                                        <Calendar className="mr-1 h-4 w-4" />
                                        {formatDateTime(project.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Projekt leírás</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {project.description ? (
                                <p className="text-muted-foreground whitespace-pre-wrap">
                                    {project.description}
                                </p>
                            ) : (
                                <p className="text-muted-foreground italic">
                                    Nincs leírás megadva ehhez a projekthez.
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Team info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>Felelős csapat</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarFallback>
                                        {project.team.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-medium">
                                        <Link
                                            href={ROUTES.TEAM_DETAIL(project.teamId)}
                                            className="hover:underline"
                                        >
                                            {project.team.name}
                                        </Link>
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        Projekt felelős csapat
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline placeholder */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Projekt timeline</CardTitle>
                            <CardDescription>
                                A projekt főbb mérföldkövei és eseményei
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500" />
                                    <div>
                                        <p className="text-sm font-medium">Projekt létrehozva</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDateTime(project.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {project.status !== ProjectStatus.PLANNING && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                                        <div>
                                            <p className="text-sm font-medium">Projekt elindítva</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(project.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {project.status === ProjectStatus.COMPLETED && (
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 rounded-full bg-green-600" />
                                        <div>
                                            <p className="text-sm font-medium">Projekt befejezve</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDateTime(project.updatedAt)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Projekt információk</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-1">Státusz</h4>
                                <Badge
                                    variant="outline"
                                    className={cn(PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS])}
                                >
                                    {formatProjectStatus(project.status)}
                                </Badge>
                            </div>

                            <div>
                                <h4 className="font-medium mb-1">Csapat</h4>
                                <Link
                                    href={ROUTES.TEAM_DETAIL(project.teamId)}
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    {project.team.name}
                                </Link>
                            </div>

                            {deadlineStatus && (
                                <div>
                                    <h4 className="font-medium mb-1">Határidő</h4>
                                    <div className={cn(
                                        "text-sm flex items-center space-x-1",
                                        deadlineStatus.isOverdue ? "text-red-600" : "text-muted-foreground"
                                    )}>
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDateTime(project.deadline!)}</span>
                                        {deadlineStatus.isOverdue && (
                                            <AlertTriangle className="h-4 w-4" />
                                        )}
                                    </div>
                                    {deadlineStatus.isOverdue && (
                                        <Badge variant="destructive" className="mt-1 text-xs">
                                            {Math.abs(deadlineStatus.daysUntil)} napja lejárt
                                        </Badge>
                                    )}
                                    {!deadlineStatus.isOverdue && deadlineStatus.daysUntil <= 7 && (
                                        <Badge variant="outline" className="mt-1 text-xs">
                                            {deadlineStatus.daysUntil === 0 ? 'Ma jár le' :
                                                deadlineStatus.daysUntil === 1 ? 'Holnap jár le' :
                                                    `${deadlineStatus.daysUntil} nap múlva`}
                                        </Badge>
                                    )}
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium mb-1">Haladás</h4>
                                <div className="space-y-2">
                                    <Progress value={progressValue} className="w-full" />
                                    <span className="text-sm text-muted-foreground">
                    {progressValue}% befejezve
                  </span>
                                </div>
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
                                <Button className="w-full" variant="outline">
                                    <Edit className="mr-2 h-4 w-4" />
                                    Projekt szerkesztése
                                </Button>
                                <Button asChild className="w-full" variant="outline">
                                    <Link href={ROUTES.TEAM_DETAIL(project.teamId)}>
                                        <Users className="mr-2 h-4 w-4" />
                                        Csapat megtekintése
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </RoleGuard>

                    {/* Status overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Státusz áttekintő</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400" />
                    <span>Tervezés</span>
                  </span>
                                    <span className={project.status === ProjectStatus.PLANNING ? 'font-medium' : 'text-muted-foreground'}>
                    20%
                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Folyamatban</span>
                  </span>
                                    <span className={project.status === ProjectStatus.IN_PROGRESS ? 'font-medium' : 'text-muted-foreground'}>
                    50%
                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span>Felülvizsgálat</span>
                  </span>
                                    <span className={project.status === ProjectStatus.REVIEW ? 'font-medium' : 'text-muted-foreground'}>
                    80%
                  </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Befejezett</span>
                  </span>
                                    <span className={project.status === ProjectStatus.COMPLETED ? 'font-medium' : 'text-muted-foreground'}>
                    100%
                  </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}