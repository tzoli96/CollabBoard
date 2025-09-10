export const APP_NAME = 'Team Collaboration Dashboard'
export const APP_VERSION = '1.0.0'

export const ROUTES = {
    HOME: '/',
    DASHBOARD: '/dashboard',
    TEAMS: '/teams',
    TEAM_DETAIL: (id: string) => `/teams/${id}`,
    TEAM_MEMBERS: (id: string) => `/teams/${id}/members`,
    CREATE_TEAM: '/teams/create',
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id: string) => `/projects/${id}`,
    CREATE_PROJECT: '/projects/create',
    AUTH_LOGIN: '/auth/login',
    AUTH_LOGOUT: '/auth/logout',
    AUTH_CALLBACK: '/auth/callback',
} as const

export const QUERY_KEYS = {
    TEAMS: ['teams'],
    TEAM: (id: string) => ['teams', id],
    TEAM_MEMBERS: (id: string) => ['teams', id, 'members'],
    PROJECTS: ['projects'],
    PROJECT: (id: string) => ['projects', id],
    AUTH_PROFILE: ['auth', 'profile'],
} as const

export const PROJECT_STATUS_COLORS = {
    planning: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-red-100 text-red-800',
} as const

export const TEAM_ROLE_COLORS = {
    member: 'bg-blue-100 text-blue-800',
    lead: 'bg-purple-100 text-purple-800',
    admin: 'bg-red-100 text-red-800',
} as const