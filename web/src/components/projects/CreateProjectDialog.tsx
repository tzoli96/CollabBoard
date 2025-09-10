'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateProject } from '@/lib/hooks/use-projects'
import { useTeams } from '@/lib/hooks/use-teams'
import { createProjectSchema } from '@/lib/utils/validation'
import { CreateProjectRequest, ProjectStatus } from '@/types/project'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
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
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Calendar } from 'lucide-react'

interface CreateProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    defaultTeamId?: string
}

export function CreateProjectDialog({
                                        open,
                                        onOpenChange,
                                        defaultTeamId
                                    }: CreateProjectDialogProps) {
    const createProjectMutation = useCreateProject()
    const { data: teams, isLoading: teamsLoading } = useTeams()

    const form = useForm<CreateProjectRequest>({
        resolver: zodResolver(createProjectSchema),
        defaultValues: {
            title: '',
            description: '',
            teamId: defaultTeamId || '',
            deadline: '',
        },
    })

    const onSubmit = async (data: CreateProjectRequest) => {
        try {
            // Format deadline if provided
            const formattedData = {
                ...data,
                deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
            }

            await createProjectMutation.mutateAsync(formattedData)
            form.reset()
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to create project:', error)
        }
    }

    const handleClose = () => {
        form.reset()
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Új projekt létrehozása</DialogTitle>
                    <DialogDescription>
                        Hozz létre egy új projektet és rendeld hozzá egy csapathoz.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                            rows={3}
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

                        <FormField
                            control={form.control}
                            name="deadline"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Határidő</FormLabel>
                                    <FormControl>
                                        <div className="relative">
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={createProjectMutation.isPending}
                            >
                                Mégse
                            </Button>
                            <Button
                                type="submit"
                                disabled={createProjectMutation.isPending}
                            >
                                {createProjectMutation.isPending ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Létrehozás...
                                    </>
                                ) : (
                                    'Létrehozás'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}