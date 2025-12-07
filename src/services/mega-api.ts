import {
  WhatsappConversation,
  WhatsappMessage,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  ChatSender,
} from '@/pages/WhatsappPanel.data'

// Service simulating Mega API interactions with "Real" capabilities
// In a real scenario, this would call the actual HTTP endpoints.
// For this demo, it simulates the backend logic on the client-side
// but structures the calls as if they were real API interactions.

class MegaApiService {
  private apiKey: string | null = null
  private webhookUrl: string | null = null
  private isConnected = false
  private conversations: WhatsappConversation[] = []
  private messages: Record<string, WhatsappMessage[]> = {}
  private listeners: ((data: any) => void)[] = []
  private pollingInterval: NodeJS.Timeout | null = null

  constructor() {
    // Load persisted config (Simulating Supabase Secrets fetch)
    const storedKey = localStorage.getItem('mega_api_key')
    const storedUrl = localStorage.getItem('mega_webhook_url')
    if (storedKey) this.apiKey = storedKey
    if (storedUrl) this.webhookUrl = storedUrl

    // Initialize with seed data if empty (Simulating DB fetch)
    if (Object.keys(this.messages).length === 0) {
      this.messages = JSON.parse(JSON.stringify(SEED_MESSAGES))
      this.conversations = [...SEED_CONVERSATIONS]
    }
  }

  // --- Configuration ---

  async updateConfiguration(
    apiKey: string,
    webhookUrl: string,
  ): Promise<boolean> {
    // Simulate secure storage
    return new Promise((resolve) => {
      setTimeout(() => {
        this.apiKey = apiKey
        this.webhookUrl = webhookUrl
        localStorage.setItem('mega_api_key', apiKey)
        localStorage.setItem('mega_webhook_url', webhookUrl)
        resolve(true)
      }, 800)
    })
  }

  getCredentials() {
    return {
      apiKey: this.apiKey,
      webhookUrl: this.webhookUrl,
    }
  }

  // --- Connection ---

  async testConnection(key: string): Promise<boolean> {
    console.log('Testing connection with key:', key)
    // Simulate an API Health Check call
    // In real implementation: await fetch('https://api.mega.com/v1/health', { headers: { Authorization: `Bearer ${key}` } })
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (key && key.length > 10) {
          resolve(true)
        } else {
          reject(new Error('Invalid API Key format'))
        }
      }, 1500)
    })
  }

  async connect(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Cannot connect: No API Key configured')
      return false
    }

    console.log('Connecting to Mega API...')
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true
        this.startWebhookSimulation()
        this.notifyListeners()
        resolve(true)
      }, 1000)
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false
        this.stopWebhookSimulation()
        this.notifyListeners()
        resolve()
      }, 500)
    })
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  // --- Data Fetching ---

  async getConversations(): Promise<WhatsappConversation[]> {
    if (!this.isConnected) {
      // Return empty if not connected to simulate "Real" behavior requiring auth
      return []
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        // Sort by last message date descending
        const sorted = [...this.conversations].sort(
          (a, b) =>
            new Date(b.ultimaMensagemEm).getTime() -
            new Date(a.ultimaMensagemEm).getTime(),
        )
        resolve(sorted)
      }, 300)
    })
  }

  async getMessages(conversationId: string): Promise<WhatsappMessage[]> {
    if (!this.isConnected) return []

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.messages[conversationId] || [])
      }, 300)
    })
  }

  // --- Messaging & AI ---

  async sendMessage(
    conversationId: string,
    content: string,
    sender: ChatSender = 'USUARIO',
  ): Promise<WhatsappMessage> {
    if (!this.isConnected) throw new Error('Not connected to Mega API')

    return new Promise((resolve) => {
      setTimeout(() => {
        const newMessage: WhatsappMessage = {
          id: `m${Date.now()}`,
          conversaId: conversationId,
          remetente: sender,
          conteudo: content,
          criadoEm: new Date().toISOString(),
          intencaoDetectada:
            sender === 'USUARIO' ? this.detectIntent(content) : undefined,
          status: 'sent',
        }

        // Update Store
        if (!this.messages[conversationId]) {
          this.messages[conversationId] = []
        }
        this.messages[conversationId].push(newMessage)

        // Update Conversation Preview
        this.updateConversationPreview(conversationId, newMessage)

        this.notifyListeners()
        resolve(newMessage)

        // Trigger Bot Response if User sent message
        if (sender === 'USUARIO') {
          this.triggerBotResponse(conversationId, content)
        }
      }, 500)
    })
  }

  private triggerBotResponse(conversationId: string, userContent: string) {
    // Determine delay based on content length to simulate "thinking"
    const thinkingTime = 1500 + Math.random() * 2000

    setTimeout(() => {
      const { text, action } = this.generateAIResponse(userContent)

      const botMessage: WhatsappMessage = {
        id: `m${Date.now()}_bot`,
        conversaId: conversationId,
        remetente: 'BOT',
        conteudo: text,
        criadoEm: new Date().toISOString(),
        acaoExecutadaPeloBot: `Ação: ${action}`,
      }

      this.messages[conversationId].push(botMessage)
      this.updateConversationPreview(conversationId, botMessage)
      this.notifyListeners()
    }, thinkingTime)
  }

  // --- AI Logic Simulation (Mega API Brain) ---

  private detectIntent(content: string): string {
    const lower = content.toLowerCase()
    if (
      lower.includes('inscrever') ||
      lower.includes('curso') ||
      lower.includes('agendar')
    )
      return 'Intenção: Inscrição em treinamento'
    if (lower.includes('cancelar') || lower.includes('desistir'))
      return 'Intenção: Cancelamento'
    if (lower.includes('certificado') || lower.includes('diploma'))
      return 'Intenção: Solicitação de certificado'
    if (lower.includes('erro') || lower.includes('problema'))
      return 'Intenção: Relato de problema técnico'
    if (lower.includes('olá') || lower.includes('oi') || lower.includes('bom'))
      return 'Intenção: Saudação'
    return 'Intenção: Desconhecida'
  }

  private generateAIResponse(content: string): {
    text: string
    action: string
  } {
    const lower = content.toLowerCase()
    if (
      lower.includes('inscrever') ||
      lower.includes('curso') ||
      lower.includes('agendar')
    ) {
      return {
        text: 'Claro! Temos vagas para Biossegurança e Primeiros Socorros. Qual você prefere?',
        action: 'Listar treinamentos disponíveis',
      }
    }
    if (lower.includes('cancelar')) {
      return {
        text: 'Entendo. Para cancelar, preciso que confirme seu CPF.',
        action: 'Iniciar fluxo de cancelamento',
      }
    }
    if (lower.includes('certificado')) {
      return {
        text: 'Os certificados são emitidos 24h após o curso. Você já verificou seu email?',
        action: 'Consultar status de certificação',
      }
    }
    if (lower.includes('olá') || lower.includes('oi')) {
      return {
        text: 'Olá! Sou o assistente virtual do HelpLab. Em que posso ajudar?',
        action: 'Saudação inicial',
      }
    }
    return {
      text: 'Desculpe, não entendi. Pode reformular sua dúvida?',
      action: 'Fallback - Transferir para humano se persistir',
    }
  }

  // --- Internal Helpers ---

  private updateConversationPreview(id: string, lastMsg: WhatsappMessage) {
    const convIndex = this.conversations.findIndex((c) => c.id === id)
    if (convIndex >= 0) {
      this.conversations[convIndex] = {
        ...this.conversations[convIndex],
        ultimaMensagemPreview: lastMsg.conteudo,
        ultimaMensagemEm: lastMsg.criadoEm,
        unreadCount:
          lastMsg.remetente === 'USUARIO'
            ? (this.conversations[convIndex].unreadCount || 0) + 1
            : 0,
      }
    } else {
      // New conversation simulation
      // In real app, this would come from a webhook event for "message_received"
    }
  }

  // --- Webhook Simulation (Polling) ---

  private startWebhookSimulation() {
    if (this.pollingInterval) clearInterval(this.pollingInterval)

    // Simulate incoming webhooks
    this.pollingInterval = setInterval(() => {
      if (this.isConnected && Math.random() > 0.85) {
        this.simulateIncomingWebhook()
      }
    }, 8000)
  }

  private stopWebhookSimulation() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private simulateIncomingWebhook() {
    const randomConv =
      this.conversations[Math.floor(Math.random() * this.conversations.length)]
    if (!randomConv) return

    const msgs = [
      'Olá, ainda tem vaga?',
      'Não recebi meu link.',
      'Gostaria de falar com atendente.',
      'Obrigado!',
      'Qual o endereço do curso?',
    ]
    const content = msgs[Math.floor(Math.random() * msgs.length)]

    this.sendMessage(randomConv.id, content, 'USUARIO').catch(console.error)
  }

  // --- Subscription Pattern ---

  subscribe(listener: (data: any) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((l) => l({ updated: Date.now() }))
  }
}

export const megaApi = new MegaApiService()
