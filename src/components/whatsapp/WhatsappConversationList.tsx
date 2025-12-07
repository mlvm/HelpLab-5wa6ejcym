import { useState, useMemo } from 'react'
import {
  Search,
  Phone,
  MessageSquare,
  Calendar as CalendarIcon,
  X,
  Circle,
} from 'lucide-react'
import {
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  WhatsappConversation,
  WhatsappConversationStatus,
} from '@/pages/WhatsappPanel.data'

interface WhatsappConversationListProps {
  conversations: WhatsappConversation[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function WhatsappConversationList({
  conversations,
  selectedId,
  onSelect,
}: WhatsappConversationListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // 1. Status Filter
      const matchesStatus =
        statusFilter === 'all' || conv.status === statusFilter

      // 2. Search Filter
      const matchesSearch =
        conv.profissionalNome
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conv.telefone.includes(searchQuery) ||
        false

      // 3. Date Range Filter
      let matchesDate = true
      if (dateRange?.from && conv.ultimaMensagemEm) {
        const convDate = parseISO(conv.ultimaMensagemEm)
        const start = startOfDay(dateRange.from)
        const end = endOfDay(dateRange.to || dateRange.from)

        matchesDate = isWithinInterval(convDate, { start, end })
      }

      return matchesStatus && matchesSearch && matchesDate
    })
  }, [conversations, statusFilter, searchQuery, dateRange])

  const getStatusBadgeVariant = (status: WhatsappConversationStatus) => {
    switch (status) {
      case 'AGENDAMENTO_CONCLUIDO':
        return 'default'
      case 'ERRO_FLUXO':
        return 'destructive'
      case 'SEM_AGENDAMENTO':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: WhatsappConversationStatus) => {
    switch (status) {
      case 'AGENDAMENTO_CONCLUIDO':
        return 'Concluído'
      case 'ERRO_FLUXO':
        return 'Erro no Fluxo'
      case 'SEM_AGENDAMENTO':
        return 'Pendente'
      default:
        return 'Outro'
    }
  }

  return (
    <div className="md:col-span-3 flex flex-col gap-4 h-full border-r pr-4">
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Conversas Recentes
          <Badge variant="secondary" className="ml-auto text-xs">
            {filteredConversations.length}
          </Badge>
        </h3>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrar lista..."
            className="pl-8 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as conversas</SelectItem>
            <SelectItem value="AGENDAMENTO_CONCLUIDO">
              Agendamento Concluído
            </SelectItem>
            <SelectItem value="SEM_AGENDAMENTO">Sem Agendamento</SelectItem>
            <SelectItem value="ERRO_FLUXO">Com Erro no Fluxo</SelectItem>
          </SelectContent>
        </Select>

        {/* Date Range Filter */}
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal h-9 px-3',
                  !dateRange && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span className="truncate">
                      {format(dateRange.from, 'dd/MM/yy')} -{' '}
                      {format(dateRange.to, 'dd/MM/yy')}
                    </span>
                  ) : (
                    <span>{format(dateRange.from, 'dd/MM/yyyy')}</span>
                  )
                ) : (
                  <span>Filtrar por data</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {dateRange && (
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => setDateRange(undefined)}
              title="Limpar filtro de data"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 -mr-3 pr-3">
        <div className="space-y-2">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={cn(
                'flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50 relative',
                selectedId === conv.id
                  ? 'bg-accent border-primary/50 shadow-sm'
                  : 'bg-card',
              )}
            >
              {/* Unread Indicator */}
              {conv.unreadCount && conv.unreadCount > 0 ? (
                <div className="absolute right-2 top-2 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              ) : null}

              <div className="flex justify-between items-start">
                <span className="font-medium text-sm truncate pr-4">
                  {conv.profissionalNome || 'Número desconhecido'}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(conv.ultimaMensagemEm).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" /> {conv.telefone}
              </span>
              <p className="text-xs text-muted-foreground/80 truncate mt-1 font-normal">
                {conv.ultimaMensagemPreview}
              </p>
              <div className="flex gap-2 mt-2">
                <Badge
                  variant={getStatusBadgeVariant(conv.status)}
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {getStatusLabel(conv.status)}
                </Badge>
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && (
            <div className="text-center p-4 text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Search className="h-8 w-8 opacity-20" />
              <p>Nenhuma conversa encontrada.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
