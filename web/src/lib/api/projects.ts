import { apiClient } from './client'
import {
    Project,
    CreateProjectRequest,
    UpdateProjectRequest,
} from '@/types/project'

export const projectsApi = {
    getProjects: (teamId?: string): Promise<Project[]> => {
        const query = teamId ? `?teamId=${teamId}` : ''
        return apiClient.get(`/projects${query}`)
    },

    getProject: (projectId: string): Promise<Project> =>
        apiClient.get(`/projects/${projectId}`),

    createProject: (data: CreateProjectRequest): Promise<Project> =>
        apiClient.post('/projects', data),

    updateProject: (projectId: string, data: UpdateProjectRequest): Promise<Project> =>
        apiClient.patch(`/projects/${projectId}`, data),

    deleteProject: (projectId: string): Promise<void> =>
        apiClient.delete(`/projects/${projectId}`),
}