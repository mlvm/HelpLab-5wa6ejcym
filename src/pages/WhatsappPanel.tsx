import { useState, useEffect } from 'react'
import { Search, Loader2, Wifi, WifiOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  WhatsappConversation,
  WhatsappMessage,
  SEED_PROFESSIONALS,
} from './WhatsappPanel.data'
import { WhatsappConversationList } from '@/components/whatsapp/WhatsappConversationList'
import { WhatsappChatWindow } from '@/components/whatsapp/WhatsappChatWindow'
import { WhatsappContextPanel } from '@/components/whatsapp/WhatsappContextPanel'
import { megaApi } from '@/services/mega-api'
import { useToast } from '@/hooks/use-toast'

export default function WhatsappPanel() {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null)
  const [conversations, setConversations] = useState<WhatsappConversation[]>([])
  const [messages, setMessages] = useState<WhatsappMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState(false)
  const [notes, setNotes] = useState('')

  const { toast } = useToast()

  // Initial Fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        // Fetch conversations from DB via service
        const convs = await megaApi.getConversations()
        setConversations(convs)

        // Check connection status simply by having creds
        const creds = await megaApi.fetchCredentials()
        if (creds.instanceKey && creds.token) {
          setConnectionStatus(true)
        }
      } catch (e) {
        console.error(e)
        toast({ variant: 'destructive', title: 'Erro ao carregar conversas' })
      } finally {
        setLoading(false)
      }
    }
    init()

    // Realtime Subscription
    const unsubscribe = megaApi.subscribe(async () => {
      const convs = await megaApi.getConversations()
      setConversations(convs)

      if (selectedConversationId) {
        const msgs = await megaApi.getMessages(selectedConversationId)
        setMessages(msgs)
      }
    })

    return () => unsubscribe()
  }, [toast, selectedConversationId])

  // Fetch messages on selection
  useEffect(() => {
    if (selectedConversationId) {
      megaApi.getMessages(selectedConversationId).then(setMessages)
    } else {
      setMessages([])
    }
  }, [selectedConversationId])

  const handleSendMessage = async (text: string) => {
    if (!selectedConversationId) return
    try {
      await megaApi.sendMessage(selectedConversationId, text, 'BOT') // Sent from UI acts as BOT/Agent
      // Optimistic update handled by subscription or manual fetch
      const msgs = await megaApi.getMessages(selectedConversationId)
      setMessages(msgs)
    } catch (e) {
      toast({ variant: 'destructive', title: 'Erro ao enviar' })
    }
  }

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId,
  )

  // Mock context for demo - in real app, fetch from DB based on phone
  const currentProfessional = selectedConversationId
    ? SEED_PROFESSIONALS[selectedConversationId] ||
      ({ nome: selectedConversation?.profissionalNome, status: 'ATIVO' } as any)
    : undefined

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in gap-4">
      <div className="flex justify-between items-center pb-4 border-b">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Painel WhatsApp</h1>
          <Badge
            variant={connectionStatus ? 'outline' : 'destructive'}
            className={cn(
              'gap-1',
              connectionStatus && 'bg-green-50 text-green-700 border-green-200',
            )}
          >
            {connectionStatus ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {connectionStatus ? 'Online' : 'Offline'}
          </Badge>
        </div>
        {loading && (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        <WhatsappConversationList
          conversations={conversations}
          selectedId={selectedConversationId}
          onSelect={setSelectedConversationId}
        />
        <WhatsappChatWindow
          conversation={selectedConversation}
          messages={messages}
          professional={currentProfessional}
          onSendMessage={handleSendMessage}
        />
        <WhatsappContextPanel
          conversation={selectedConversation}
          professional={currentProfessional}
          appointments={[]} // Empty for now or fetch real
          messageCount={messages.length}
          notes={notes}
          setNotes={setNotes}
        />
      </div>
    </div>
  )
}
