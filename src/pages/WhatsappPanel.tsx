import { useState } from 'react'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import {
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_PROFESSIONALS,
  MOCK_APPOINTMENTS,
} from './WhatsappPanel.data'
import { WhatsappConversationList } from '@/components/whatsapp/WhatsappConversationList'
import { WhatsappChatWindow } from '@/components/whatsapp/WhatsappChatWindow'
import { WhatsappContextPanel } from '@/components/whatsapp/WhatsappContextPanel'

export default function WhatsappPanel() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [notes, setNotes] = useState('')
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(true)

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
        <WhatsappConversationList
          conversations={MOCK_CONVERSATIONS}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />

        {/* Center Column: Chat Window */}
        <WhatsappChatWindow
          conversation={selectedConversation}
          messages={currentMessages}
          professional={currentProfessional}
        />

        {/* Right Column: Context Panel */}
        <WhatsappContextPanel
          conversation={selectedConversation}
          professional={currentProfessional}
          appointments={currentAppointments}
          messageCount={currentMessages.length}
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </div>
  )
}
