export interface Project {
    id: string
    title: string
    description?: string
    teamId: string
    team?: {
        name: string
    }
    status: ProjectStatus
    createdAt: string
    updatedAt: string
    deadline?: string
}

export interface CreateProjectRequest {
    title: string
    description?: string
    teamId: string
    deadline?: string
}

export interface UpdateProjectRequest {
    title?: string
    description?: string
    status?: ProjectStatus
    deadline?: string
}

export enum ProjectStatus {
    PLANNING = 'planning',
    IN_PROGRESS = 'in_progress',
    REVIEW = 'review',
    COMPLETED = 'completed',
    ON_HOLD = 'on_hold'
}