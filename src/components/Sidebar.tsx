import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  CalendarCheck,
  BarChart,
  Settings,
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Bot,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface SidebarProps {
  isCollapsed: boolean
  toggleCollapse: () => void
  className?: string
}

export function Sidebar({
  isCollapsed,
  toggleCollapse,
  className,
}: SidebarProps) {
  const location = useLocation()

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Bot, label: 'Assistente IA', href: '/whatsapp-panel' },
    { icon: Users, label: 'Profissionais', href: '/professionals' },
    { icon: BookOpen, label: 'Catálogo', href: '/trainings' },
    { icon: Calendar, label: 'Agenda e Turmas', href: '/schedule' },
    { icon: CalendarCheck, label: 'Agendamentos', href: '/appointments' },
    { icon: BarChart, label: 'Relatórios', href: '/reports' },
    { icon: FileText, label: 'Auditoria', href: '/audit' },
    { icon: MessageSquare, label: 'Comunicações', href: '/communications' },
    { icon: Settings, label: 'Configurações', href: '/settings' },
    { icon: UserCircle, label: 'Meu Histórico', href: '/my-history' },
  ]

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-[60px]' : 'w-[240px]',
        className,
      )}
    >
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-accent text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                    isCollapsed && 'justify-center px-2',
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
                  )}
                  <item.icon
                    className={cn('h-5 w-5', isActive && 'text-primary')}
                  />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">{item.label}</TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>

      <div className="p-2 border-t mt-auto">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center hover:bg-secondary"
          onClick={toggleCollapse}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="flex items-center justify-between w-full px-2">
              <span className="text-xs text-muted-foreground">Recolher</span>
              <ChevronLeft className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </aside>
  )
}
