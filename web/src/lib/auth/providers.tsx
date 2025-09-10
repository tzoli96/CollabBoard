'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { keycloak, initKeycloak, hasRole, hasAnyRole } from './keycloak'
import { User } from '@/types/auth'

interface AuthContextType {
    isAuthenticated: boolean
    user: User | null
    token: string | null
    roles: string[]
    login: () => void
    logout: () => void
    hasRole: (role: string) => boolean
    hasAnyRole: (roles: string[]) => boolean
    isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const init = async () => {
            try {
                const authenticated = await initKeycloak()
                setIsAuthenticated(authenticated)

                if (authenticated && keycloak.tokenParsed) {
                    const tokenData = keycloak.tokenParsed as any
                    setUser({
                        id: tokenData.sub,
                        username: tokenData.preferred_username,
                        email: tokenData.email,
                        firstName: tokenData.given_name,
                        lastName: tokenData.family_name,
                        roles: keycloak.realmAccess?.roles || [],
                    })
                }
            } catch (error) {
                console.error('Auth initialization failed:', error)
            } finally {
                setIsLoading(false)
            }
        }

        init()
    }, [])

    const value: AuthContextType = {
        isAuthenticated,
        user,
        token: keycloak.token || null,
        roles: keycloak.realmAccess?.roles || [],
        login: () => keycloak.login(),
        logout: () => keycloak.logout(),
        hasRole,
        hasAnyRole,
        isLoading,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}