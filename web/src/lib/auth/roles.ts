export const ROLES = {
    REALM_ADMIN: 'realm-admin',
    REALM_TEAM_LEAD: 'realm-team-lead',
    TEAM_MEMBER: 'member',
    TEAM_LEAD: 'lead',
} as const

export type Role = typeof ROLES[keyof typeof ROLES]

export const isAdmin = (roles: string[]): boolean => {
    return roles.includes(ROLES.REALM_ADMIN)
}

export const isTeamLead = (roles: string[]): boolean => {
    return roles.includes(ROLES.REALM_TEAM_LEAD)
}

export const canCreateTeam = (roles: string[]): boolean => {
    return isAdmin(roles) || isTeamLead(roles)
}

export const canManageTeam = (roles: string[]): boolean => {
    return isAdmin(roles) || isTeamLead(roles)
}