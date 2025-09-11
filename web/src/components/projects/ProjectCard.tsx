'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Project, ProjectStatus } from '@/types/project'
import { useAuth } from '@/lib/auth/providers'
import { useDeleteProject } from '@/lib/hooks/use-projects'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Users,
    Calendar,
    Clock
} from 'lucide-react'
import { formatRelativeTime, formatProjectStatus, formatDate } from '@/lib/utils/formatters'
import { PROJECT_STATUS_COLORS } from '@/lib/utils/constants'
import { ROUTES } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    const { hasAnyRole } = useAuth()
    const deleteProjectMutation = useDeleteProject()
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

    const canManageProject = hasAnyRole(['admin', 'team-lead'])

    const handleDelete = async () => {
        try {
            await deleteProjectMutation.mutateAsync(project.id)
            setDeleteDialogOpen(false)
        } catch (error) {
            console.error('Failed to delete project:', error)
        }
    }

    const isOverdue = project.deadline && new Date(project.deadline) < new Date() &&
        project.status !== ProjectStatus.COMPLETED

    const deadlineStatus = project.deadline ? {
        date: new Date(project.deadline),
        isOverdue,
        daysUntil: Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    } : null

    return (
        <>
            <Card className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                            <div className="flex items-center space-x-2">
                                <CardTitle className="text-lg">
                                    <Link
                                        href={ROUTES.PROJECT_DETAIL(project.id)}
                                        className="hover:underline"
                                    >
                                        {project.title}
                                    </Link>
                                </CardTitle>
                                <Badge
                                    variant="outline"
                                    className={cn(PROJECT_STATUS_COLORS[project.status as keyof typeof PROJECT_STATUS_COLORS])}
                                >
                                    {formatProjectStatus(project.status)}
                                </Badge>
                            </div>
                            {project.description && (
                                <CardDescription className="line-clamp-2">
                                    {project.description}
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
                                        <span className="sr-only">Projekt opciók</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem asChild>
                                        <Link href={ROUTES.PROJECT_DETAIL(project.id)}>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Megtekintés
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
                    {/* Team info */}
                    <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                    {project.teamName.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{project.teamName}</span>
                        </div>
                    </div>

                    {/* Deadline */}
                    {deadlineStatus && (
                        <div className={cn(
                            "flex items-center space-x-2 text-sm",
                            deadlineStatus.isOverdue ? "text-red-600" : "text-muted-foreground"
                        )}>
                            <Calendar className="h-4 w-4" />
                            <span>
                {deadlineStatus.isOverdue
                    ? `Lejárt ${Math.abs(deadlineStatus.daysUntil)} napja`
                    : deadlineStatus.daysUntil === 0
                        ? "Ma jár le"
                        : deadlineStatus.daysUntil === 1
                            ? "Holnap jár le"
                            : `${deadlineStatus.daysUntil} nap múlva`
                }
              </span>
                            {deadlineStatus.isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                    Lejárt
                                </Badge>
                            )}
                        </div>
                    )}

                    {/* Progress indicator */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Állapot</span>
                            <span className="font-medium">{formatProjectStatus(project.status)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className={cn(
                                    "h-2 rounded-full transition-all",
                                    project.status === ProjectStatus.COMPLETED ? "bg-green-500" :
                                        project.status === ProjectStatus.IN_PROGRESS ? "bg-blue-500" :
                                            project.status === ProjectStatus.REVIEW ? "bg-yellow-500" :
                                                project.status === ProjectStatus.ON_HOLD ? "bg-red-500" :
                                                    "bg-gray-400"
                                )}
                                style={{
                                    width: project.status === ProjectStatus.COMPLETED ? '100%' :
                                        project.status === ProjectStatus.REVIEW ? '80%' :
                                            project.status === ProjectStatus.IN_PROGRESS ? '50%' :
                                                project.status === ProjectStatus.PLANNING ? '20%' :
                                                    '0%'
                                }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatRelativeTime(project.updatedAt)}</span>
                        </div>
                        <Button asChild size="sm" variant="outline">
                            <Link href={ROUTES.PROJECT_DETAIL(project.id)}>
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
                title="Projekt törlése"
                description={`Biztosan törölni szeretnéd a "${project.title}" projektet? Ez a művelet nem vonható vissza.`}
                confirmText="Törlés"
                cancelText="Mégse"
                variant="destructive"
                onConfirm={handleDelete}
            />
        </>
    )
}
