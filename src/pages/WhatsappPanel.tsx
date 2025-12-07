import { useState, useMemo } from 'react'
import {
  Search,
  User,
  Phone,
  Calendar,
  MessageSquare,
  MoreVertical,
  Bot,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_PROFESSIONALS,
  MOCK_APPOINTMENTS,
  type WhatsappConversationStatus,
} from './WhatsappPanel.data'

export default function WhatsappPanel() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notes, setNotes] = useState('')
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(true)

  // Filter Conversations
  const filteredConversations = useMemo(() => {
    return MOCK_CONVERSATIONS.filter((conv) => {
      const matchesStatus =
        statusFilter === 'all' || conv.status === statusFilter
      const matchesSearch =
        conv.profissionalNome
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        conv.telefone.includes(searchQuery) ||
        false

      return matchesStatus && matchesSearch
    })
  }, [statusFilter, searchQuery])

  // Get Current Data
  const selectedConversation = MOCK_CONVERSATIONS.find(
    (c) => c.id === selectedConversationId,
  )
  const currentMessages = selectedConversationId
    ? MOCK_MESSAGES[selectedConversationId] || []
    : []
  const currentProfessional = selectedConversationId
    ? MOCK_PROFESSIONALS[selectedConversationId]
    : undefined
  const currentAppointments = MOCK_APPOINTMENTS.filter(
    (a) => a.conversaId === selectedConversationId,
  )

  const getStatusBadgeVariant = (status: WhatsappConversationStatus) => {
    switch (status) {
      case 'AGENDAMENTO_CONCLUIDO':
        return 'default' // primary
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
        return 'Agendamento Concluído'
      case 'ERRO_FLUXO':
        return 'Erro no Fluxo'
      case 'SEM_AGENDAMENTO':
        return 'Sem Agendamento'
      default:
        return 'Outro'
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in gap-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Assistente de IA – WhatsApp
            </h1>
            <div className="flex items-center gap-2">
              <Switch
                id="whatsapp-status"
                checked={isWhatsappConnected}
                onCheckedChange={setIsWhatsappConnected}
              />
              <Label
                htmlFor="whatsapp-status"
                className={cn(
                  'text-sm font-medium transition-colors cursor-pointer',
                  isWhatsappConnected
                    ? 'text-green-600'
                    : 'text-muted-foreground',
                )}
              >
                {isWhatsappConnected
                  ? 'Conectado ao WhatsApp'
                  : 'Desconectado ao WhatsApp'}
              </Label>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Monitoramento das conversas entre o bot HelpLab e os profissionais
            via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Select defaultValue="today">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="custom">Intervalo personalizado</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar global..."
              className="pl-9 bg-background"
            />
          </div>
        </div>
      </div>

      {/* Main Layout - 3 Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Left Column: Conversation List */}
        <div className="md:col-span-3 flex flex-col gap-4 h-full border-r pr-4">
          <div className="flex flex-col gap-2">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" /> Conversas Recentes
            </h3>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filtrar lista..."
                className="pl-8 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
          </div>

          <ScrollArea className="flex-1 -mr-3 pr-3">
            <div className="space-y-2">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversationId(conv.id)}
                  className={cn(
                    'flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent/50',
                    selectedConversationId === conv.id
                      ? 'bg-accent border-primary/50 shadow-sm'
                      : 'bg-card',
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm truncate">
                      {conv.profissionalNome || 'Número desconhecido'}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(conv.ultimaMensagemEm).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {conv.telefone}
                  </span>
                  <p className="text-xs text-muted-foreground/80 truncate mt-1">
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
                <div className="text-center p-4 text-sm text-muted-foreground">
                  Nenhuma conversa encontrada.
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Center Column: Chat Window */}
        <div className="md:col-span-6 flex flex-col h-full bg-muted/10 rounded-lg border overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="bg-background border-b p-3 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        currentProfessional?.avatarSeed
                          ? `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${currentProfessional.avatarSeed}`
                          : undefined
                      }
                    />
                    <AvatarFallback>
                      {selectedConversation.profissionalNome
                        ?.substring(0, 2)
                        .toUpperCase() || '??'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-sm">
                      {selectedConversation.profissionalNome ||
                        selectedConversation.telefone}
                    </h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Bot className="h-3 w-3 text-primary" /> Última intenção:{' '}
                      {currentMessages
                        .filter((m) => m.remetente === 'USUARIO')
                        .pop()
                        ?.intencaoDetectada?.replace('Intenção:', '') ||
                        'Desconhecida'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => console.log('Ver profissional')}
                >
                  Ver profissional <MoreVertical className="ml-1 h-3 w-3" />
                </Button>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-1 p-4 bg-muted/5">
                <div className="space-y-6">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex flex-col max-w-[80%]',
                        msg.remetente === 'USUARIO'
                          ? 'self-start items-start'
                          : 'self-end items-end ml-auto',
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {msg.remetente === 'USUARIO'
                            ? 'Usuário'
                            : 'Bot HelpLab'}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {msg.criadoEm}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-2 text-sm shadow-sm',
                          msg.remetente === 'USUARIO'
                            ? 'bg-white border text-foreground rounded-tl-none'
                            : 'bg-primary text-primary-foreground rounded-tr-none',
                        )}
                      >
                        {msg.conteudo}
                      </div>

                      {/* Metadata Tags */}
                      {msg.intencaoDetectada && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                        >
                          <Bot className="h-3 w-3 mr-1" />{' '}
                          {msg.intencaoDetectada}
                        </Badge>
                      )}
                      {msg.acaoExecutadaPeloBot && (
                        <Badge
                          variant="secondary"
                          className="mt-1 text-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />{' '}
                          {msg.acaoExecutadaPeloBot}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Readonly Footer */}
              <div className="p-3 border-t bg-background text-center text-xs text-muted-foreground">
                <AlertCircle className="h-3 w-3 inline-block mr-1" />
                Este painel é apenas para visualização. Não é possível enviar
                mensagens por aqui.
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
              <p>Selecione uma conversa para visualizar o histórico</p>
            </div>
          )}
        </div>

        {/* Right Column: Context Panel */}
        <div className="md:col-span-3 flex flex-col gap-4 h-full border-l pl-4">
          <ScrollArea className="h-full -mr-3 pr-3">
            <div className="space-y-6">
              {/* Profissional Data */}
              {selectedConversationId ? (
                <>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <User className="h-4 w-4" /> Dados do Profissional
                    </h3>
                    {currentProfessional ? (
                      <Card>
                        <CardContent className="p-4 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Nome
                            </p>
                            <p className="font-medium text-sm">
                              {currentProfessional.nome}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-muted-foreground">
                                CPF
                              </p>
                              <p className="font-medium text-sm">
                                {currentProfessional.cpf}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Status
                              </p>
                              <Badge
                                variant={
                                  currentProfessional.status === 'ATIVO'
                                    ? 'default'
                                    : 'secondary'
                                }
                                className="mt-0.5 text-[10px]"
                              >
                                {currentProfessional.status}
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Unidade
                            </p>
                            <p className="font-medium text-sm">
                              {currentProfessional.unidade}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="w-full h-8 text-xs mt-2"
                            onClick={() =>
                              console.log('Abrir ficha', currentProfessional.id)
                            }
                          >
                            Abrir ficha completa{' '}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <Card className="bg-muted/30 border-dashed">
                        <CardContent className="p-4 text-center py-8">
                          <p className="text-xs text-muted-foreground">
                            Profissional não identificado na base de dados.
                          </p>
                          <Button
                            variant="link"
                            className="h-auto p-0 text-xs mt-2"
                          >
                            Vincular manualmente
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <Separator />

                  {/* Appointments */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Agendamentos
                    </h3>
                    {currentAppointments.length > 0 ? (
                      <div className="space-y-2">
                        {currentAppointments.map((apt) => (
                          <Card key={apt.id} className="bg-muted/10">
                            <CardContent className="p-3">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-xs text-primary">
                                  {apt.treinamentoNome}
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[10px]"
                                >
                                  {apt.status}
                                </Badge>
                              </div>
                              <p className="text-xs font-medium">
                                {apt.turmaDescricao}
                              </p>
                              <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                                  Via {apt.origem}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Nenhum agendamento vinculado a esta conversa.
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Internal Notes */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" /> Notas Internas
                    </h3>
                    <Textarea
                      placeholder="Adicione observações sobre este atendimento..."
                      className="text-xs resize-none min-h-[100px]"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 text-[10px] text-muted-foreground space-y-1">
                    <p>ID Conversa: {selectedConversationId}</p>
                    <p>Origem: WhatsApp API</p>
                    <p>
                      Mensagens: {MOCK_MESSAGES[selectedConversationId]?.length}
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  <p>
                    Detalhes do contexto aparecerão aqui ao selecionar uma
                    conversa.
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
