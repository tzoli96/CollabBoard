import Keycloak from 'keycloak-js'

export const keycloakConfig = {
    url: process.env.NEXT_PUBLIC_KEYCLOAK_URL!,
    realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM!,
    clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID!,
}

export const keycloak = new Keycloak(keycloakConfig)

// Globális inicializáció státusz
let initPromise: Promise<boolean> | null = null
let isInitialized = false

export const initKeycloak = async (): Promise<boolean> => {
    // Ha már van folyamatban lévő inicializáció, várjuk meg azt
    if (initPromise) {
        console.log('Keycloak initialization already in progress, waiting...')
        return initPromise
    }

    // Ha már inicializálódott, visszaadjuk a jelenlegi állapotot
    if (isInitialized) {
        console.log('Keycloak already initialized, returning current state:', keycloak.authenticated || false)
        return keycloak.authenticated || false
    }

    // Új inicializáció indítása
    initPromise = performInitialization()

    try {
        const result = await initPromise
        isInitialized = true
        return result
    } catch (error) {
        console.error('Keycloak initialization failed:', error)
        initPromise = null // Reset promise on failure
        return false
    }
}

async function performInitialization(): Promise<boolean> {
    try {
        console.log('Keycloak config:', keycloakConfig)

        const initWithTimeout = Promise.race([
            keycloak.init({
                onLoad: 'check-sso',
                silentCheckSsoRedirectUri: `${window.location.origin}/auth/callback`,
                silentCheckSsoFallback: false,
                pkceMethod: 'S256',
                checkLoginIframe: false,
                messageReceiveTimeout: 10000,
            }),
            new Promise<boolean>((_, reject) =>
                setTimeout(() => reject(new Error('Keycloak init timeout')), 15000)
            )
        ])

        const authenticated = await initWithTimeout

        console.log('Keycloak authenticated:', authenticated)

        if (authenticated) {
            console.log('Setting up token refresh...')
            // Set up automatic token refresh
            setInterval(() => {
                keycloak.updateToken(70).catch(() => {
                    console.error('Failed to refresh token')
                })
            }, 60000)
        } else {
            console.log('Silent SSO failed - user needs to log in manually')
        }

        return authenticated
    } catch (error) {
        console.error('Keycloak initialization error:', error)
        throw error
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