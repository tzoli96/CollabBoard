import { PageHeader } from '@/components/common/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Üdvözöljük!"
                description="Csapat és projekt menüpontok használatával kezelheti a munkáját."
            />

            <Card>
                <CardHeader>
                    <CardTitle>Kezdés</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        Használja a navigációs menüt a csapatok és projektek kezeléséhez.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}