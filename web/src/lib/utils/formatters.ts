import { format, formatDistanceToNow } from 'date-fns'
import { hu } from 'date-fns/locale'

export const formatDate = (date: string | Date): string => {
    return format(new Date(date), 'yyyy. MM. dd.', { locale: hu })
}

export const formatDateTime = (date: string | Date): string => {
    return format(new Date(date), 'yyyy. MM. dd. HH:mm', { locale: hu })
}

export const formatRelativeTime = (date: string | Date): string => {
    return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: hu
    })
}

export const formatProjectStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
        planning: 'Tervezés',
        in_progress: 'Folyamatban',
        review: 'Felülvizsgálat',
        completed: 'Befejezett',
        on_hold: 'Felfüggesztve',
    }

    return statusMap[status] || status
}

export const formatTeamRole = (role: string): string => {
    const roleMap: Record<string, string> = {
        member: 'Tag',
        lead: 'Vezető',
        admin: 'Admin',
    }

    return roleMap[role] || role
}