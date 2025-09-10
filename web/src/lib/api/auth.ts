import { apiClient } from './client'
import { User, AuthProfile } from '@/types/auth'

export const authApi = {
    getMe: (): Promise<User> =>
        apiClient.get('/auth/me'),

    getProfile: (): Promise<AuthProfile> =>
        apiClient.get('/auth/profile'),

    getAdminInfo: (): Promise<any> =>
        apiClient.get('/auth/admin'),

    testAuth: (): Promise<any> =>
        apiClient.post('/auth/test'),
}