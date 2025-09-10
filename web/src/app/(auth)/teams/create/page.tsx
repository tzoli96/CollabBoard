'use client'

import { useRouter } from 'next/navigation'
import { useCreateTeam } from '@/lib/hooks/use-teams'
import { TeamForm } from '@/components/teams/TeamForm'
import { PageHeader } from '@/components/common/PageHeader'
import { CreateTeamRequest } from '@/types/team'
import { ROUTES } from '@/lib/utils/constants'

export default function CreateTeamPage() {
    const router = useRouter()
    const createTeamMutation = useCreateTeam()

    const handleSubmit = async (data: CreateTeamRequest) => {
        try {
            const newTeam = await createTeamMutation.mutateAsync(data)
            router.push(ROUTES.TEAM_DETAIL(newTeam.id))
        } catch (error) {
            console.error('Failed to create team:', error)
            // Error is handled by the mutation hook with toast
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Új csapat létrehozása"
                description="Hozz létre egy új csapatot projektjeid koordinálásához"
            />

            <div className="max-w-2xl">
                <TeamForm
                    onSubmit={handleSubmit}
                    isLoading={createTeamMutation.isPending}
                    submitLabel="Csapat létrehozása"
                />
            </div>
        </div>
    )
}