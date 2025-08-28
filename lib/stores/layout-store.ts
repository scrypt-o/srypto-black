import { create } from 'zustand'

interface LayoutState {
  // Sidebar state
  sidebarCollapsed: boolean
  mobileSidebarOpen: boolean
  
  // Theme state
  theme: 'light' | 'dark' | 'system'
  
  // Actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useLayoutStore = create<LayoutState>((set) => ({
  // Initial state
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  theme: 'system',
  
  // Actions
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  openMobileSidebar: () => set({ mobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  setTheme: (theme) => set({ theme }),
}))