'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAddMember, useAvailableUsers } from '@/lib/hooks/use-teams'
import { addMemberSchema } from '@/lib/utils/validation'
import { AddMemberRequest, TeamRole } from '@/types/team'
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'

interface AddMemberDialogProps {
    teamId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddMemberDialog({
                                    teamId,
                                    open,
                                    onOpenChange
                                }: AddMemberDialogProps) {
    const addMemberMutation = useAddMember(teamId)
    const { data: availableUsers = [], isLoading } = useAvailableUsers(teamId)
    const [searchTerm, setSearchTerm] = useState('')

    const form = useForm<AddMemberRequest>({
        resolver: zodResolver(addMemberSchema),
        defaultValues: {
            userId: '',
            role: TeamRole.member,
        },
    })

    const onSubmit = async (data: AddMemberRequest) => {
        try {
            await addMemberMutation.mutateAsync(data)
            form.reset()
            setSearchTerm('')
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to add member:', error)
        }
    }

    const handleClose = () => {
        form.reset()
        setSearchTerm('')
        onOpenChange(false)
    }

    // Filter available users based on search term
    const filteredUsers = availableUsers.filter(user => {
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
        const searchLower = searchTerm.toLowerCase()
        
        return fullName.includes(searchLower) || 
               user.email.toLowerCase().includes(searchLower)
    })

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Tag hozzáadása</DialogTitle>
                    <DialogDescription>
                        Adj hozzá egy új tagot a csapathoz.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {/* User search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Felhasználó keresése</label>
                            <Input
                                placeholder="Keresés név vagy email alapján..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={isLoading}
                            />

                            {searchTerm && (
                                <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
                                    {isLoading ? (
                                        <div className="flex justify-center py-2">
                                            <LoadingSpinner size="sm" />
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-2">
                                            Nincs találat
                                        </p>
                                    ) : (
                                        filteredUsers.map((user) => (
                                            <div
                                                key={user.id}
                                                className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                                                onClick={() => {
                                                    form.setValue('userId', user.id)
                                                    setSearchTerm(`${user.firstName} ${user.lastName}`)
                                                }}
                                            >
                                                <div>
                                                    <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <FormField
                            control={form.control}
                            name="userId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kiválasztott felhasználó</FormLabel>
                                    <FormControl>
                                        <Input
                                            value={
                                                field.value 
                                                    ? availableUsers.find(u => u.id === field.value)
                                                        ? `${availableUsers.find(u => u.id === field.value)?.firstName} ${availableUsers.find(u => u.id === field.value)?.lastName}`
                                                        : ''
                                                    : ''
                                            }
                                            placeholder="Válassz egy felhasználót"
                                            readOnly
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Szerepkör</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Válassz szerepkört" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={TeamRole.member}>Tag</SelectItem>
                                            <SelectItem value={TeamRole["team-lead"]}>Csapatvezető</SelectItem>
                                            <SelectItem value={TeamRole.admin}>Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={addMemberMutation.isPending}
                            >
                                Mégse
                            </Button>
                            <Button
                                type="submit"
                                disabled={addMemberMutation.isPending || !form.watch('userId')}
                            >
                                {addMemberMutation.isPending ? (
                                    <>
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Hozzáadás...
                                    </>
                                ) : (
                                    'Hozzáadás'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}