'use client';

import { useTeams } from '@/lib/hooks/use-teams';
import { TeamCard } from './TeamCard';
import { LoadingSpinner } from '../common/LoadingSpinner';

export function TeamList() {
    const { data: teams, isLoading, error } = useTeams();

    if (isLoading) return <LoadingSpinner />;
    if (error) return <div>Hiba történt: {error.message}</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams?.map((team) => (
                <TeamCard key={team.id} team={team} />
            ))}
        </div>
    );
}