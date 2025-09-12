// Egyetlen egységes role rendszer - csak Keycloak alapú
export const ROLES = {
    ADMIN: 'admin',
    TEAM_LEAD: 'team-lead', 
    MEMBER: 'member',
    // Backward compatibility - REALM_ prefixed versions
    REALM_ADMIN: 'admin',
    REALM_TEAM_LEAD: 'team-lead',
    REALM_MEMBER: 'member',
} as const;

// Backward compatibility exports
export const KEYCLOAK_ROLES = ROLES;
export const TEAM_ROLES = {
    ADMIN: 'admin',
    TEAM_LEAD: 'team-lead',
    MEMBER: 'member',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
export type KeycloakRole = Role;
export type TeamRole = Role;

// Role utility functions
export const isAdmin = (roles: string[]): boolean => 
    roles.includes(ROLES.ADMIN);

export const isTeamLead = (roles: string[]): boolean => 
    roles.includes(ROLES.TEAM_LEAD);

export const canManageTeam = (roles: string[]): boolean => 
    isAdmin(roles) || isTeamLead(roles);