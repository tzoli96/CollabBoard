import { useQuery } from '@tanstack/react-query'
import { authApi } from '../api/auth'
import { useAuth as useAuthContext } from '../auth/providers'

export const useAuth = () => {
    return useAuthContext()
}

export const useAuthProfile = () => {
    const { isAuthenticated } = useAuth()

    return useQuery({
        queryKey: ['auth', 'profile'],
        queryFn: authApi.getProfile,
        enabled: isAuthenticated,
    })
}

export const useAdminCheck = () => {
    const { hasRole } = useAuth()
    return hasRole('realm-admin')
}