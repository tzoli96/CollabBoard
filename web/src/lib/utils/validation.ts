import { z } from 'zod'

export const createTeamSchema = z.object({
    name: z.string().min(2, 'A csapat nevének legalább 2 karakter hosszúnak kell lennie'),
    description: z.string().optional(),
})

export const updateTeamSchema = z.object({
    name: z.string().min(2, 'A csapat nevének legalább 2 karakter hosszúnak kell lennie').optional(),
    description: z.string().optional(),
})

export const createProjectSchema = z.object({
    title: z.string().min(2, 'A projekt címének legalább 2 karakter hosszúnak kell lennie'),
    description: z.string().optional(),
    teamId: z.string().min(1, 'Csapat kiválasztása kötelező'),
    deadline: z.string().optional(),
})

export const updateProjectSchema = z.object({
    title: z.string().min(2, 'A projekt címének legalább 2 karakter hosszúnak kell lennie').optional(),
    description: z.string().optional(),
    status: z.enum(['planning', 'in_progress', 'review', 'completed', 'on_hold']).optional(),
    deadline: z.string().optional(),
})

export const addMemberSchema = z.object({
    userId: z.string().min(1, 'Felhasználó kiválasztása kötelező'),
    role: z.enum(['member', 'lead']),
})