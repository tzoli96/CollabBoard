import Keycloak from 'keycloak-js'

export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
}

export const keycloak = new Keycloak(keycloakConfig)

export const initKeycloak = async (): Promise<boolean> => {
    try {
        const authenticated = await keycloak.init({
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: `${window.location.origin}/auth/callback`,
            pkceMethod: 'S256',
            checkLoginIframe: false,
        })

        if (authenticated) {
            // Set up automatic token refresh
            setInterval(() => {
                keycloak.updateToken(70).catch(() => {
                    console.error('Failed to refresh token')
                })
            }, 60000) // Check every minute
        }

        return authenticated
    } catch (error) {
        console.error('Keycloak initialization failed:', error)
        return false
    }
}

export const login = () => {
    return keycloak.login({
        redirectUri: `${window.location.origin}/dashboard`,
    })
}

export const logout = () => {
    return keycloak.logout({
        redirectUri: `${window.location.origin}/`,
    })
}

export const hasRole = (role: string): boolean => {
    return keycloak.hasRealmRole(role)
}

export const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role))
}