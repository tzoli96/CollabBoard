import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h2 className="text-2xl font-bold">Oldal nem található</h2>
            <p className="mt-2 text-muted-foreground">
                A keresett oldal nem létezik.
            </p>
            <Button asChild className="mt-4">
                <Link href="/dashboard">Vissza a dashboardra</Link>
            </Button>
        </div>
    )
}