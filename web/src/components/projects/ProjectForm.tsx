'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Project, CreateProjectRequest, UpdateProjectRequest, ProjectStatus } from '@/types/project'
import { useTeams } from '@/lib/hooks/use-teams'
import { createProjectSchema, updateProjectSchema } from '@/lib/utils/validation'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Calendar } from 'lucide-react'
import { formatProjectStatus } from '@/lib/utils/formatters'

interface ProjectFormProps {
    project?: Project // If provided, this is an edit form
    onSubmit: (data: CreateProjectRequest | UpdateProjectRequest) => Promise<void>
    isLoading?: boolean
    submitLabel?: string
}

export function ProjectForm({
                                project,
                                onSubmit,
                                isLoading = false,
                                submitLabel
                            }: ProjectFormProps) {
    const isEdit = !!project
    const schema = isEdit ? updateProjectSchema : createProjectSchema
    const { data: teams, isLoading: teamsLoading } = useTeams()

    const form = useForm<CreateProjectRequest | UpdateProjectRequest>({
        resolver: zodResolver(schema),
        defaultValues: {
            title: project?.title || '',
            description: project?.description || '',
            teamId: project?.teamId || '',
            deadline: project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
            ...(isEdit && { status: project?.status }),
        },
    })

    const handleSubmit = async (data: CreateProjectRequest | UpdateProjectRequest) => {
        try {
            const formattedData = {
                ...data,
                deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
            }

            await onSubmit(formattedData)
            if (!isEdit) {
                form.reset()
            }
        } catch (error) {
            console.error('Form submission error:', error)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>
                    {isEdit ? 'Projekt szerkesztése' : 'Új projekt létrehozása'}
                </CardTitle>
                <CardDescription>
                    {isEdit
                        ? 'Módosítsd a projekt adatait és státuszát.'
                        : 'Hozz létre egy új projektet és rendeld hozzá egy csapathoz.'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Projekt címe</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="pl. E-commerce weboldal"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Leírás</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Projekt leírása (opcionális)"
                                            className="resize-none"
                                            rows={4}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Add meg a projekt célját és főbb feladatait.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="teamId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Csapat</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Válassz csapatot" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {teamsLoading ? (
                                                    <SelectItem value="" disabled>
                                                        Csapatok betöltése...
                                                    </SelectItem>
                                                ) : teams?.length === 0 ? (
                                                    <SelectItem value="" disabled>
                                                        Nincsenek elérhető csapatok
                                                    </SelectItem>
                                                ) : (
                                                    teams?.map((team) => (
                                                        <SelectItem key={team.id} value={team.id}>
                                                            <div className="flex items-center space-x-2">
                                                                <span>{team.name}</span>
                                                                <span className="text-muted-foreground text-xs">
                                  ({team.members.length} tag)
                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {isEdit && (
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Státusz</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Válassz státuszt" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value={ProjectStatus.PLANNING}>
                                                        {formatProjectStatus(ProjectStatus.PLANNING)}
                                                    </SelectItem>
                                                    <SelectItem value={ProjectStatus.IN_PROGRESS}>
                                                        {formatProjectStatus(ProjectStatus.IN_PROGRESS)}
                                                    </SelectItem>
                                                    <SelectItem value={ProjectStatus.REVIEW}>
                                                        {formatProjectStatus(ProjectStatus.REVIEW)}
                                                    </SelectItem>
                                                    <SelectItem value={ProjectStatus.COMPLETED}>
                                                        {formatProjectStatus(ProjectStatus.COMPLETED)}
                                                    </SelectItem>
                                                    <SelectItem value={ProjectStatus.ON_HOLD}>
                                                        {formatProjectStatus(ProjectStatus.ON_HOLD)}
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Határidő</FormLabel>
                                    <FormControl>
                                        <div className="relative max-w-sm">
                                            <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                type="date"
                                                className="pl-8"
                                                {...field}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormDescription>
                                        Opcionális határidő a projekthez.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="min-w-[120px]"
                            >
                                {isLoading ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        {isEdit ? 'Mentés...' : 'Létrehozás...'}
                                    </>
                                ) : (
                                    submitLabel || (isEdit ? 'Mentés' : 'Létrehozás')
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}