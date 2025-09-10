import { keycloak } from '../auth/keycloak'

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public code?: string
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

class ApiClient {
    private baseURL: string

    constructor() {
        this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    }

    private async getHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        if (keycloak.authenticated && keycloak.token) {
            // Ensure token is fresh
            await keycloak.updateToken(30)
            headers.Authorization = `Bearer ${keycloak.token}`
        }

        return headers
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new ApiError(
                errorData.message || `HTTP error! status: ${response.status}`,
                response.status,
                errorData.code
            )
        }

        return response.json()
    }

    async get<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'GET',
            headers: await this.getHeaders(),
        })

        return this.handleResponse<T>(response)
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'POST',
            headers: await this.getHeaders(),
            body: data ? JSON.stringify(data) : undefined,
        })

        return this.handleResponse<T>(response)
    }

    async patch<T>(endpoint: string, data: any): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'PATCH',
            headers: await this.getHeaders(),
            body: JSON.stringify(data),
        })

        return this.handleResponse<T>(response)
    }

    async delete<T>(endpoint: string): Promise<T> {
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            method: 'DELETE',
            headers: await this.getHeaders(),
        })

        return this.handleResponse<T>(response)
    }
}

export const apiClient = new ApiClient()