'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCreateProject } from '@/lib/hooks/use-projects'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { PageHeader } from '@/components/common/PageHeader'
import { CreateProjectRequest } from '@/types/project'
import { ROUTES } from '@/lib/utils/constants'

export default function CreateProjectPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const createProjectMutation = useCreateProject()

    // Get teamId from query params if provided
    const defaultTeamId = searchParams.get('teamId') || undefined

    const handleSubmit = async (data: CreateProjectRequest) => {
        try {
            const newProject = await createProjectMutation.mutateAsync(data)
            router.push(ROUTES.PROJECT_DETAIL(newProject.id))
        } catch (error) {
            console.error('Failed to create project:', error)
            // Error is handled by the mutation hook with toast
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Új projekt létrehozása"
                description="Hozz létre egy új projektet és rendeld hozzá egy csapathoz"
            />

            <div className="max-w-2xl">
                <ProjectForm
                    onSubmit={handleSubmit}
                    isLoading={createProjectMutation.isPending}
                    submitLabel="Projekt létrehozása"
                />
            </div>
        </div>
    )
}