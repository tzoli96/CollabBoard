// Egyetlen egységes role rendszer - Keycloak alapú
export const ROLES = {
    ADMIN: 'ADMIN',
    TEAM_LEAD: 'TEAM_LEAD',
    MEMBER: 'MEMBER',
} as const

// Backward compatibility exports
export const KEYCLOAK_ROLES = ROLES
export const TEAM_ROLES = ROLES

export type Role = typeof ROLES[keyof typeof ROLES]
export type KeycloakRole = Role
export type TeamRole = Role

export const isAdmin = (roles: string[]): boolean => {
    return roles.includes(ROLES.ADMIN)
}

export const isTeamLead = (roles: string[]): boolean => {
    return roles.includes(ROLES.TEAM_LEAD)
}

export const canCreateTeam = (roles: string[]): boolean => {
    return isAdmin(roles) || isTeamLead(roles)
}

export const canManageTeam = (roles: string[]): boolean => {
    return isAdmin(roles) || isTeamLead(roles)
}