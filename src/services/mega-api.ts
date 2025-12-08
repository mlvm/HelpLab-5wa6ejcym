import { supabase } from '@/lib/supabase/client'
import {
  WhatsappConversation,
  WhatsappMessage,
  ChatSender,
} from '@/pages/WhatsappPanel.data'

export interface MegaApiConfig {
  instanceKey: string
  token: string
}

class MegaApiService {
  private listeners: ((data: any) => void)[] = []

  constructor() {}

  // --- DB Access Methods ---

  async getConversations(): Promise<WhatsappConversation[]> {
    const { data, error } = await supabase
      .from('whatsapp_conversations')
      .select('*')
      .order('last_message_at', { ascending: false })

    if (error) {
      console.error('Error fetching conversations:', error)
      return []
    }

    // Map DB to UI types
    return data.map((c: any) => ({
      id: c.id,
      telefone: c.contact_phone_number,
      profissionalNome: c.contact_name || c.contact_phone_number,
      ultimaMensagemPreview: c.last_message_preview || '...',
      ultimaMensagemEm: c.last_message_at,
      status: c.status === 'open' ? 'SEM_AGENDAMENTO' : 'OUTRO', // Simplified mapping
      origem: 'WHATSAPP',
      unreadCount: c.unread_count,
    }))
  }

  async getMessages(conversationId: string): Promise<WhatsappMessage[]> {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error)
      return []
    }

    return data.map((m: any) => {
      let sender: ChatSender = 'BOT'
      if (m.sender_type === 'contact')
        sender = 'USUARIO' // Contact UI
      else if (m.sender_type === 'user')
        sender = 'AGENT' // Human Agent UI (e.g. system admin)
      else if (m.sender_type === 'ai') sender = 'BOT' // AI Bot UI

      return {
        id: m.id,
        conversaId: m.conversation_id,
        remetente: sender,
        conteudo: m.content,
        criadoEm: m.timestamp,
        status: m.status,
      }
    })
  }

  // --- Proxy Methods ---

  async connect(
    config?: MegaApiConfig,
  ): Promise<{ success: boolean; message: string }> {
    const { data, error } = await supabase.functions.invoke('mega-api-proxy', {
      body: {
        action: 'test_connection',
        ...config,
      },
    })

    if (error || !data?.success) {
      return {
        success: false,
        message: data?.message || error?.message || 'Failed to connect',
      }
    }

    // Register Webhook (Best Effort)
    const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mega-api-proxy`
    this.configureWebhook(webhookUrl, config)

    return { success: true, message: 'Conectado' }
  }

  async configureWebhook(url: string, config?: MegaApiConfig) {
    await supabase.functions.invoke('mega-api-proxy', {
      body: {
        action: 'configure_webhook',
        webhookUrl: url,
        ...config,
      },
    })
  }

  async sendMessage(
    conversationId: string,
    content: string,
    sender: ChatSender = 'BOT', // Sender in UI terms
    forcePhone?: string,
  ): Promise<void> {
    let phone = forcePhone
    let contactName = ''

    if (!phone && conversationId) {
      // Resolve phone from conversation ID
      const { data } = await supabase
        .from('whatsapp_conversations')
        .select('contact_phone_number, contact_name')
        .eq('id', conversationId)
        .single()
      phone = data?.contact_phone_number
      contactName = data?.contact_name
    }

    if (!phone) throw new Error('Phone number not found')

    // Determine sender_type for DB
    let dbSenderType = 'ai'
    if (sender === 'AGENT') dbSenderType = 'user'
    if (sender === 'USUARIO') dbSenderType = 'contact'

    if (dbSenderType === 'contact') {
      // Simulate incoming message
      const { data, error } = await supabase.functions.invoke(
        'mega-api-proxy',
        {
          body: {
            action: 'simulate_incoming',
            phone: phone,
            message: content,
            name: contactName,
          },
        },
      )
      if (error || !data?.success)
        throw new Error(data?.message || error?.message)
    } else {
      // Send outgoing message
      const { data, error } = await supabase.functions.invoke(
        'mega-api-proxy',
        {
          body: {
            action: 'send_message',
            phone: phone,
            message: content,
            senderType: dbSenderType,
            instanceKey: localStorage.getItem('mega_instance_key'),
            token: localStorage.getItem('mega_token'),
          },
        },
      )
      if (error || !data?.success)
        throw new Error(data?.message || error?.message)
    }

    // Notify listeners
    this.notifyListeners()
  }

  async findOrCreateConversation(phone: string, name: string): Promise<string> {
    // Check local DB
    const { data: existing } = await supabase
      .from('whatsapp_conversations')
      .select('id')
      .eq('contact_phone_number', phone)
      .single()

    if (existing) return existing.id

    // Create
    const { data: newConv, error } = await supabase
      .from('whatsapp_conversations')
      .insert({
        contact_phone_number: phone,
        contact_name: name,
        status: 'open',
      })
      .select()
      .single()

    if (error) throw error
    return newConv.id
  }

  // --- Subscriptions ---

  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener)
    const channel = supabase
      .channel('whatsapp-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'whatsapp_messages' },
        () => {
          this.notifyListeners()
        },
      )
      .subscribe()

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
      supabase.removeChannel(channel)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l({ updated: Date.now() }))
  }

  // Configuration Helper
  getCredentials() {
    return {
      instanceKey: localStorage.getItem('mega_instance_key') || '',
      token: localStorage.getItem('mega_token') || '',
      aiProvider: localStorage.getItem('ai_provider') as 'chatgpt' | 'gemini',
      aiModel: localStorage.getItem('ai_model') || 'gpt-4o-mini',
    }
  }

  updateCredentials(instanceKey: string, token: string) {
    localStorage.setItem('mega_instance_key', instanceKey)
    localStorage.setItem('mega_token', token)
  }
}

export const megaApi = new MegaApiService()
