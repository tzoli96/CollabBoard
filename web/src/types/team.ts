export interface Team {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt: string
    members: TeamMember[]
    projectCount: number
}

export interface User {
    id: string
    keycloakId: string
    email: string
    firstName: string
    lastName: string
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface TeamMember {
    id: string
    userId: string
    teamId: string
    role: TeamRole
    joinedAt: string
    user: User
}

export interface CreateTeamRequest {
    name: string
    description?: string
}

export interface UpdateTeamRequest {
    name?: string
    description?: string
}

export interface AddMemberRequest {
    userId: string
    role?: TeamRole
}

export enum TeamRole {
    member = 'member',
    "team-lead" = 'team-lead',
    admin = 'admin'
}