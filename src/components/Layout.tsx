import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export default function Layout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const location = useLocation()

  // Hide layout for login page
  if (location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onMenuClick={() => setIsMobileOpen(true)} />

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <Sidebar
          className="hidden md:flex"
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Mobile Sidebar (Drawer) */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetContent side="left" className="p-0 w-[240px] pt-16">
            <Sidebar
              className="w-full static border-none h-full"
              isCollapsed={false}
              toggleCollapse={() => {}}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main
          className={cn(
            'flex-1 transition-all duration-300 overflow-x-hidden',
            'md:ml-[240px]',
            isSidebarCollapsed && 'md:ml-[60px]',
          )}
        >
          <div className="container mx-auto p-6 md:p-8 animate-fade-in">
            <Outlet />
          </div>

          <footer className="py-6 border-t mt-auto text-center text-sm text-muted-foreground bg-background">
            <p>
              © 2024 HelpLab - Gestão de Treinamentos em Saúde. Versão 0.0.1
            </p>
          </footer>
        </main>
      </div>
    </div>
  )
}
