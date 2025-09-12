import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { teamsApi } from '../api/teams'
import {
    Team,
    User,
    CreateTeamRequest,
    UpdateTeamRequest,
    AddMemberRequest,
    UpdateMemberRoleRequest,
} from '@/types/team'
import toast from 'react-hot-toast'

export const useTeams = () => {
    return useQuery<Team[]>({
        queryKey: ['teams'],
        queryFn: teamsApi.getTeams,
    })
}

export const useTeam = (teamId: string) => {
    return useQuery<Team>({
        queryKey: ['teams', teamId],
        queryFn: () => teamsApi.getTeam(teamId),
        enabled: !!teamId,
    })
}

export const useTeamMembers = (teamId: string) => {
    return useQuery({
        queryKey: ['teams', teamId, 'members'],
        queryFn: () => teamsApi.getMembers(teamId),
        enabled: !!teamId,
    })
}

export const useAvailableUsers = (teamId: string) => {
    return useQuery<User[]>({
        queryKey: ['teams', teamId, 'available-users'],
        queryFn: () => teamsApi.getAvailableUsers(teamId),
        enabled: !!teamId,
    })
}

export const useCreateTeam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateTeamRequest) => teamsApi.createTeam(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
            toast.success('Csapat sikeresen létrehozva!')
        },
        onError: (error) => {
            toast.error('Hiba történt a csapat létrehozásakor')
            console.error(error)
        },
    })
}

export const useUpdateTeam = (teamId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateTeamRequest) => teamsApi.updateTeam(teamId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
            queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
            toast.success('Csapat sikeresen frissítve!')
        },
        onError: () => {
            toast.error('Hiba történt a csapat frissítésekor')
        },
    })
}

export const useDeleteTeam = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (teamId: string) => teamsApi.deleteTeam(teamId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] })
            toast.success('Csapat sikeresen törölve!')
        },
        onError: () => {
            toast.error('Hiba történt a csapat törlésekor')
        },
    })
}

export const useAddMember = (teamId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: AddMemberRequest) => teamsApi.addMember(teamId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
            queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
            toast.success('Tag sikeresen hozzáadva!')
        },
        onError: () => {
            toast.error('Hiba történt a tag hozzáadásakor')
        },
    })
}

export const useUpdateMemberRole = (teamId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberRoleRequest }) =>
            teamsApi.updateMemberRole(teamId, userId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
            toast.success('Tag szerepe sikeresen frissítve!')
        },
        onError: () => {
            toast.error('Hiba történt a tag szerepének frissítésekor')
        },
    })
}

export const useRemoveMember = (teamId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (userId: string) => teamsApi.removeMember(teamId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'members'] })
            queryClient.invalidateQueries({ queryKey: ['teams', teamId] })
            toast.success('Tag sikeresen eltávolítva!')
        },
        onError: () => {
            toast.error('Hiba történt a tag eltávolításakor')
        },
    })
}