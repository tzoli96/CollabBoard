export interface User {
    id: string
    username: string
    email: string
    firstName?: string
    lastName?: string
    roles: string[]
    createdAt: string
    updatedAt: string
}

export interface UserProfile extends User {
    teams: TeamMembership[]
}