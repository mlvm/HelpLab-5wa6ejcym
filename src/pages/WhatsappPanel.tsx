import { useState, useEffect } from 'react'
import { Search, Loader2, Wifi, WifiOff, AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
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
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

import {
  WhatsappConversation,
  WhatsappMessage,
  SEED_PROFESSIONALS,
  SEED_APPOINTMENTS,
} from './WhatsappPanel.data'
import { WhatsappConversationList } from '@/components/whatsapp/WhatsappConversationList'
import { WhatsappChatWindow } from '@/components/whatsapp/WhatsappChatWindow'
import { WhatsappContextPanel } from '@/components/whatsapp/WhatsappContextPanel'
import { megaApi } from '@/services/mega-api'

export default function WhatsappPanel() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [notes, setNotes] = useState('')
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [missingConfig, setMissingConfig] = useState(false)
  const [conversations, setConversations] = useState<WhatsappConversation[]>([])
  const [messages, setMessages] = useState<WhatsappMessage[]>([])
  const { toast } = useToast()

  // Initial Load & Connection
  useEffect(() => {
    const init = async () => {
      try {
        // Check for credentials first
        const creds = megaApi.getCredentials()
        if (!creds.apiKey) {
          setMissingConfig(true)
          setIsLoading(false)
          return
        }

        // Connect with stored credentials
        const connected = await megaApi.connect()
        if (connected) {
          setIsWhatsappConnected(true)
          const convs = await megaApi.getConversations()
          setConversations(convs)
        } else {
          toast({
            variant: 'destructive',
            title: 'Falha na Conexão',
            description:
              'Verifique suas credenciais da Mega API nas configurações.',
          })
        }
      } catch (error) {
        console.error('Failed to connect to Mega API', error)
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description: 'Falha crítica ao conectar com a Mega API.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    init()

    // Subscribe to real-time updates
    const unsubscribe = megaApi.subscribe(async () => {
      const updatedConvs = await megaApi.getConversations()
      setConversations(updatedConvs)

      if (selectedConversationId) {
        const updatedMsgs = await megaApi.getMessages(selectedConversationId)
        setMessages(updatedMsgs)
      }
    })

    return () => {
      unsubscribe()
      megaApi.disconnect()
    }
  }, [toast, selectedConversationId])

  // Fetch messages when conversation selected
  useEffect(() => {
    if (selectedConversationId) {
      const fetchMsgs = async () => {
        const msgs = await megaApi.getMessages(selectedConversationId)
        setMessages(msgs)
      }
      fetchMsgs()
    } else {
      setMessages([])
    }
  }, [selectedConversationId])

  const handleConnectionToggle = async (checked: boolean) => {
    setIsLoading(true)
    try {
      if (checked) {
        const connected = await megaApi.connect()
        if (connected) {
          setIsWhatsappConnected(true)
          toast({
            title: 'Conectado',
            description: 'Serviço de IA Mega API ativo.',
          })
        } else {
          toast({
            variant: 'destructive',
            title: 'Erro',
            description:
              'Não foi possível conectar. Verifique as configurações.',
          })
        }
      } else {
        await megaApi.disconnect()
        setIsWhatsappConnected(false)
        toast({
          title: 'Desconectado',
          description: 'Serviço de IA pausado.',
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async (text: string, sender: 'USUARIO' | 'BOT') => {
    if (selectedConversationId) {
      try {
        await megaApi.sendMessage(selectedConversationId, text, sender)
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao enviar',
          description: 'Verifique sua conexão com a Mega API.',
        })
      }
    }
  }

  // Get Current Data Helpers
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  )

  // Fallback to SEED for professionals if not in dynamic list (mock implementation detail)
  const currentProfessional = selectedConversationId
    ? SEED_PROFESSIONALS[selectedConversationId]
    : undefined

  const currentAppointments = SEED_APPOINTMENTS.filter(
    (a) => a.conversaId === selectedConversationId,
  )

  if (missingConfig) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] animate-fade-in">
        <div className="text-center space-y-4 max-w-md p-6 border rounded-lg bg-slate-50">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-bold">Configuração Necessária</h2>
          <p className="text-muted-foreground">
            Para acessar o painel do WhatsApp, é necessário configurar as
            credenciais da Mega API.
          </p>
          <Button asChild>
            <Link to="/settings">Ir para Configurações</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in gap-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Assistente de IA – WhatsApp
              {isLoading && (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              )}
            </h1>
            <div className="flex items-center gap-2 ml-4 bg-muted/30 px-3 py-1 rounded-full border">
              <Switch
                id="whatsapp-status"
                checked={isWhatsappConnected}
                onCheckedChange={handleConnectionToggle}
                disabled={isLoading}
              />
              <Label
                htmlFor="whatsapp-status"
                className={cn(
                  'text-sm font-medium transition-colors cursor-pointer flex items-center gap-2',
                  isWhatsappConnected
                    ? 'text-green-600'
                    : 'text-muted-foreground',
                )}
              >
                {isWhatsappConnected ? (
                  <>
                    <Wifi className="h-3 w-3" /> Conectado: Mega API
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" /> Desconectado
                  </>
                )}
              </Label>
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Monitoramento em tempo real das conversas e raciocínio da IA.
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
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />

        {/* Center Column: Chat Window */}
        <WhatsappChatWindow
          conversation={selectedConversation}
          messages={messages}
          professional={currentProfessional}
          onSendMessage={handleSendMessage}
          isProcessing={isLoading}
        />

        {/* Right Column: Context Panel */}
        <WhatsappContextPanel
          conversation={selectedConversation}
          professional={currentProfessional}
          appointments={currentAppointments}
          messageCount={messages.length}
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </div>
  )
}
