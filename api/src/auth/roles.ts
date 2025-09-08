export const ROLES = {
  REALM_ADMIN: 'realm:admin',
  REALM_MEMBER: 'realm:member',
  REALM_TEAM_LEAD: 'realm:team-lead',
} as const;

export type RoleValue = typeof ROLES[keyof typeof ROLES];
