'use client'

import { useTeam } from '@/lib/hooks/use-teams'
import { MembersList } from '@/components/teams/MembersList'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface TeamMembersPageProps {
    params: {
        teamId: string
    }
}

export default function TeamMembersPage({ params }: TeamMembersPageProps) {
    const { teamId } = params
    const { data: team, isLoading } = useTeam(teamId)

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" text="Csapat betöltése..." />
            </div>
        )
    }

    return (
        <MembersList
            teamId={teamId}
            teamName={team?.name}
        />
    )
}