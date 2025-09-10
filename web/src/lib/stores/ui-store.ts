import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIStore {
    sidebarOpen: boolean
    setSidebarOpen: (open: boolean) => void
    toggleSidebar: () => void
}

export const useUIStore = create<UIStore>()(
    devtools(
        (set) => ({
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: 'ui-store',
        }
    )
)