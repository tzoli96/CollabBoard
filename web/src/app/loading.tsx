import { LoadingSpinner } from '@/components/common/LoadingSpinner'

export default function Loading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <LoadingSpinner size="lg" />
        </div>
    )
}