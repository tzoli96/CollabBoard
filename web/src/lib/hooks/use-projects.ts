import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api/projects'
import {
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
} from '@/types/project'
import toast from 'react-hot-toast'

export const useProjects = (teamId?: string) => {
    return useQuery<Project[]>({
        queryKey: ['projects', { teamId }],
        queryFn: () => projectsApi.getProjects(teamId),
    })
}

export const useProject = (projectId: string) => {
    return useQuery<Project>({
        queryKey: ['projects', projectId],
        queryFn: () => projectsApi.getProject(projectId),
        enabled: !!projectId,
    })
}

export const useCreateProject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateProjectRequest) => projectsApi.createProject(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Projekt sikeresen létrehozva!')
        },
        onError: () => {
            toast.error('Hiba történt a projekt létrehozásakor')
        },
    })
}

export const useUpdateProject = (projectId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateProjectRequest) => projectsApi.updateProject(projectId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            queryClient.invalidateQueries({ queryKey: ['projects', projectId] })
            toast.success('Projekt sikeresen frissítve!')
        },
        onError: () => {
            toast.error('Hiba történt a projekt frissítésekor')
        },
    })
}

export const useDeleteProject = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (projectId: string) => projectsApi.deleteProject(projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] })
            toast.success('Projekt sikeresen törölve!')
        },
        onError: () => {
            toast.error('Hiba történt a projekt törlésekor')
        },
    })
}