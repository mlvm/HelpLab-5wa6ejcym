import { useState, useEffect } from 'react'
import {
  Search,
  Loader2,
  Wifi,
  WifiOff,
  AlertTriangle,
  Zap,
  Cpu,
} from 'lucide-react'
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
import { megaApi, AIProvider } from '@/services/mega-api'

export default function WhatsappPanel() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [notes, setNotes] = useState('')
  const [isWhatsappConnected, setIsWhatsappConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [missingConfig, setMissingConfig] = useState(false)
  const [conversations, setConversations] = useState<WhatsappConversation[]>([])
  const [messages, setMessages] = useState<WhatsappMessage[]>([])
  const [currentProvider, setCurrentProvider] = useState<AIProvider>('chatgpt')

  const { toast } = useToast()

  // Initial Load & Connection
  useEffect(() => {
    const init = async () => {
      try {
        // Check for credentials first
        const creds = megaApi.getCredentials()
        setCurrentProvider(creds.aiProvider || 'chatgpt')

        // Check if at least one valid AI config exists (provider + key)
        const hasAiConfig =
          (creds.aiProvider === 'chatgpt' && creds.openaiApiKey) ||
          (creds.aiProvider === 'gemini' && creds.geminiApiKey)

        // Only warn about missing AI config, do NOT block
        if (!hasAiConfig) {
          // We could set missingConfig(true) if we wanted to block,
          // but for Mega API testing we allow proceeding.
        }

        // Connect with stored credentials (Mega API credentials are now on server)
        const { success, message } = await megaApi.connect()

        if (success) {
          setIsWhatsappConnected(true)
          setConnectionError(null)
          const convs = await megaApi.getConversations()
          setConversations(convs)
        } else {
          setConnectionError(message)
          toast({
            variant: 'destructive',
            title: 'Falha na Conexão',
            description:
              message || 'Verifique suas credenciais nas configurações.',
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

      // Update provider if changed in settings
      const creds = megaApi.getCredentials()
      if (creds.aiProvider) setCurrentProvider(creds.aiProvider)

      if (selectedConversationId) {
        const updatedMsgs = await megaApi.getMessages(selectedConversationId)
        setMessages(updatedMsgs)
      }
    })

    return () => {
      unsubscribe()
      // megaApi.disconnect() is not available on instance, handled by state
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
        const { success, message } = await megaApi.connect()
        if (success) {
          setIsWhatsappConnected(true)
          setConnectionError(null)
          toast({
            title: 'Conectado',
            description: 'Serviço de Mensagens e IA ativos.',
          })
        } else {
          setConnectionError(message)
          toast({
            variant: 'destructive',
            title: 'Erro',
            description:
              message ||
              'Não foi possível conectar. Verifique as configurações.',
          })
        }
      } else {
        // Disconnect logic is internal to service via connect toggle in real implementation,
        // but here we just update state as connect/disconnect methods are simplified
        setIsWhatsappConnected(false)
        setConnectionError(null)
        toast({
          title: 'Desconectado',
          description: 'Serviços pausados.',
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
          description: 'Verifique sua conexão com a API.',
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
        <div className="text-center space-y-4 max-w-md p-6 border rounded-lg bg-slate-50 shadow-sm">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
          <h2 className="text-xl font-bold">Configuração Necessária</h2>
          <p className="text-muted-foreground text-sm">
            Para utilizar o painel inteligente, é necessário configurar as
            credenciais de <strong>IA (OpenAI ou Gemini)</strong>.
          </p>
          <Button asChild>
            <Link to="/settings">Configurar Integrações</Link>
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
            <div className="flex flex-col ml-4">
              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full border">
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
                      <Wifi className="h-3 w-3" /> Online
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3 w-3" /> Offline
                    </>
                  )}
                </Label>
              </div>
            </div>
            {isWhatsappConnected && (
              <div
                className={cn(
                  'hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-xs font-medium transition-colors',
                  currentProvider === 'gemini'
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-green-50 border-green-200 text-green-700',
                )}
              >
                {currentProvider === 'gemini' ? (
                  <>
                    <Cpu className="h-3 w-3" /> Gemini Ativo
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" /> ChatGPT Ativo
                  </>
                )}
              </div>
            )}
          </div>
          {connectionError && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-destructive animate-fade-in">
              <AlertTriangle className="h-3.5 w-3.5" />
              Status da Conexão: {connectionError}
            </div>
          )}
          {!connectionError && (
            <p className="text-muted-foreground mt-1 text-sm">
              Monitoramento em tempo real com respostas geradas via Supabase
              Edge Functions.
            </p>
          )}
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
