import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  CalendarCheck,
  BarChart,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Bot,
  Building2,
  GraduationCap,
  ChevronDown,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({
    Configurações: true,
  })

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Bot, label: 'Assistente de IA', href: '/whatsapp-panel' },
    { icon: CalendarCheck, label: 'Agendamentos', href: '/appointments' },
    { icon: Calendar, label: 'Agenda e Turmas', href: '/schedule' },
    { icon: BookOpen, label: 'Catálogo', href: '/trainings' },
    { icon: MessageSquare, label: 'Comunicações', href: '/communications' },
    { icon: GraduationCap, label: 'Instrutores', href: '/instructors' },
    { icon: Users, label: 'Profissionais', href: '/professionals' },
    { icon: Building2, label: 'Unidades', href: '/units' },
    { icon: BarChart, label: 'Relatórios', href: '/reports' },
    {
      icon: Settings,
      label: 'Configurações',
      href: '/settings',
      subItems: [
        { label: 'Integrações & IA', href: '/settings' },
        { label: 'Usuário', href: '/settings/account' },
        { label: 'Status', href: '/settings/status' },
        { label: 'Auditoria', href: '/settings/audit' },
      ],
    },
  ]

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

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
          // Check if parent or any child is active
          const isParentActive =
            location.pathname === item.href ||
            (item.subItems &&
              item.subItems.some((sub) => location.pathname === sub.href))

          // Special handling for collapse state with submenus
          if (item.subItems && isCollapsed) {
            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'w-full h-10 flex justify-center',
                      isParentActive && 'bg-accent text-primary',
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="right"
                  className="w-56"
                  align="start"
                >
                  <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {item.subItems.map((sub) => (
                    <DropdownMenuItem key={sub.href} asChild>
                      <Link
                        to={sub.href}
                        className={cn(
                          'w-full cursor-pointer',
                          location.pathname === sub.href && 'bg-accent',
                        )}
                      >
                        {sub.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }

          // Collapsible Menu for Expanded State
          if (item.subItems) {
            return (
              <Collapsible
                key={item.label}
                open={openSubmenus[item.label]}
                onOpenChange={() => toggleSubmenu(item.label)}
                className="w-full"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-between px-3 py-2 text-sm font-medium hover:bg-secondary hover:text-foreground',
                      isParentActive && 'text-primary bg-accent/50',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform duration-200',
                        openSubmenus[item.label] ? 'rotate-180' : '',
                      )}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1 pb-2">
                  {item.subItems.map((sub) => {
                    const isSubActive = location.pathname === sub.href
                    return (
                      <Link
                        key={sub.href}
                        to={sub.href}
                        className={cn(
                          'flex items-center gap-3 rounded-md pl-11 pr-3 py-2 text-sm transition-colors relative',
                          isSubActive
                            ? 'bg-accent text-primary font-medium'
                            : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
                        )}
                      >
                        {isSubActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-primary rounded-r-full" />
                        )}
                        {sub.label}
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          // Standard Item
          const isActive = location.pathname === item.href
          return (
            <Tooltip key={item.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={item.href || '#'}
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
