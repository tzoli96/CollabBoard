export interface User {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    roles: string[]
}

export interface AuthState {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    isLoading: boolean
}

export interface LoginRequest {
    username: string
    password: string
}

export interface AuthProfile {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    teams: TeamMembership[]
}

export interface TeamMembership {
    teamId: string
    teamName: string
    role: TeamRole
}

export enum TeamRole {
    MEMBER = 'member',
    LEAD = 'lead',
    ADMIN = 'admin'
}