import { apiClient } from './client'
import {
    Team,
    TeamMember,
    CreateTeamRequest,
    UpdateTeamRequest,
    AddMemberRequest,
    UpdateMemberRoleRequest,
} from '@/types/team'

export const teamsApi = {
    getTeams: (): Promise<Team[]> =>
        apiClient.get('/teams'),

    getTeam: (teamId: string): Promise<Team> =>
        apiClient.get(`/teams/${teamId}`),

    createTeam: (data: CreateTeamRequest): Promise<Team> =>
        apiClient.post('/teams', data),

    updateTeam: (teamId: string, data: UpdateTeamRequest): Promise<Team> =>
        apiClient.patch(`/teams/${teamId}`, data),

    deleteTeam: (teamId: string): Promise<void> =>
        apiClient.delete(`/teams/${teamId}`),

    getMembers: (teamId: string): Promise<TeamMember[]> =>
        apiClient.get(`/teams/${teamId}/members`),

    addMember: (teamId: string, data: AddMemberRequest): Promise<TeamMember> =>
        apiClient.post(`/teams/${teamId}/members`, data),

    updateMemberRole: (
        teamId: string,
        userId: string,
        data: UpdateMemberRoleRequest
    ): Promise<TeamMember> =>
        apiClient.patch(`/teams/${teamId}/members/${userId}`, data),

    removeMember: (teamId: string, userId: string): Promise<void> =>
        apiClient.delete(`/teams/${teamId}/members/${userId}`),
}