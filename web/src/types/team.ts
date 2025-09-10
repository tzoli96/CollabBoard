export interface Team {
    id: string
    name: string
    description?: string
    createdAt: string
    updatedAt: string
    members: TeamMember[]
    projectCount: number
}

export interface TeamMember {
    id: string
    userId: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    role: TeamRole
    joinedAt: string
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
    role: TeamRole
}

export interface UpdateMemberRoleRequest {
    role: TeamRole
}

export enum TeamRole {
    MEMBER = 'member',
    LEAD = 'lead'
}