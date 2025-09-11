'use client'

import { useState } from 'react'
import { useProjects } from '@/lib/hooks/use-projects'
import { useTeams } from '@/lib/hooks/use-teams'
import { useAuth } from '@/lib/auth/providers'
import { ProjectCard } from './ProjectCard'
import { CreateProjectDialog } from './CreateProjectDialog'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { FolderOpen, Plus, Search, Filter } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'
import { ProjectStatus } from '@/types/project'
import { formatProjectStatus } from '@/lib/utils/formatters'
import { PROJECT_STATUS_COLORS } from '@/lib/utils/constants'
import { cn } from '@/lib/utils'

export function ProjectList() {
    const { data: projects, isLoading, error } = useProjects()
    const { data: teams } = useTeams()
    const { hasAnyRole } = useAuth()

    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
    const [teamFilter, setTeamFilter] = useState<string>('all')

    const debouncedSearch = useDebounce(searchTerm, 300)
    const canCreateProject = hasAnyRole(['admin', 'team-lead'])

    const filteredProjects = projects?.filter(project => {
        const matchesSearch =
            project.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            project.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            project.teamName.toLowerCase().includes(debouncedSearch.toLowerCase())

        const matchesStatus = statusFilter === 'all' || project.status === statusFilter
        const matchesTeam = teamFilter === 'all' || project.teamId === teamFilter

        return matchesSearch && matchesStatus && matchesTeam
    })

    // Stats
    const projectStats = projects ? {
        total: projects.length,
        active: projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length,
        completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        planning: projects.filter(p => p.status === ProjectStatus.PLANNING).length,
    } : { total: 0, active: 0, completed: 0, planning: 0 }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader title="Projektek" description="Projekt kezelés és nyomon követés" />
                <LoadingSpinner size="lg" text="Projektek betöltése..." />
            </div>
        )
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageHeader title="Projektek" description="Projekt kezelés és nyomon követés" />
                <div className="text-center text-red-600">
                    Hiba történt a projektek betöltése során: {error.message}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Projektek"
                description="Projekt kezelés és nyomon követés"
            >
                <RoleGuard roles={['admin', 'team-lead']}>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Új projekt
                    </Button>
                </RoleGuard>
            </PageHeader>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-1">
                        <FolderOpen className="h-3 w-3" />
                        <span>{projectStats.total} összes</span>
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge className={cn(PROJECT_STATUS_COLORS.in_progress)}>
                        {projectStats.active} aktív
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge className={cn(PROJECT_STATUS_COLORS.completed)}>
                        {projectStats.completed} kész
                    </Badge>
                </div>
                <div className="flex items-center space-x-2">
                    <Badge className={cn(PROJECT_STATUS_COLORS.planning)}>
                        {projectStats.planning} tervezés
                    </Badge>
                </div>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Projektek keresése..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ProjectStatus | 'all')}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Státusz" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Minden státusz</SelectItem>
                            <SelectItem value={ProjectStatus.PLANNING}>Tervezés</SelectItem>
                            <SelectItem value={ProjectStatus.IN_PROGRESS}>Folyamatban</SelectItem>
                            <SelectItem value={ProjectStatus.REVIEW}>Felülvizsgálat</SelectItem>
                            <SelectItem value={ProjectStatus.COMPLETED}>Befejezett</SelectItem>
                            <SelectItem value={ProjectStatus.ON_HOLD}>Felfüggesztve</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={teamFilter} onValueChange={setTeamFilter}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Csapat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Minden csapat</SelectItem>
                            {teams?.map((team) => (
                                <SelectItem key={team.id} value={team.id}>
                                    {team.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Projects grid */}
            {!filteredProjects || filteredProjects.length === 0 ? (
                <EmptyState
                    icon={FolderOpen}
                    title={debouncedSearch || statusFilter !== 'all' || teamFilter !== 'all' ? "Nincs találat" : "Még nincsenek projektek"}
                    description={
                        debouncedSearch || statusFilter !== 'all' || teamFilter !== 'all'
                            ? "Próbálj más keresési feltételt vagy szűrőt."
                            : "Kezdj el egy új projekt létrehozásával!"
                    }
                    action={
                        canCreateProject && !debouncedSearch && statusFilter === 'all' && teamFilter === 'all'
                            ? {
                                label: "Új projekt létrehozása",
                                onClick: () => setCreateDialogOpen(true),
                            }
                            : undefined
                    }
                />
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* Create project dialog */}
            <CreateProjectDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </div>
    )
}