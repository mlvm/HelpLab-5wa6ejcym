import {
  WhatsappConversation,
  WhatsappMessage,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  ChatSender,
} from '@/pages/WhatsappPanel.data'

// Mock API Service simulating Mega API interactions
class MegaApiService {
  private isConnected = false
  private conversations: WhatsappConversation[] = [...SEED_CONVERSATIONS]
  private messages: Record<string, WhatsappMessage[]> = JSON.parse(
    JSON.stringify(SEED_MESSAGES),
  )
  private listeners: ((data: any) => void)[] = []

  constructor() {
    // Simulate some background activity
    setInterval(() => {
      if (this.isConnected && Math.random() > 0.95) {
        this.simulateIncomingMessage()
      }
    }, 10000)
  }

  // --- Connection ---

  async connect(apiKey: string): Promise<boolean> {
    console.log('Connecting to Mega API with key:', apiKey)
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = true
        this.notifyListeners()
        resolve(true)
      }, 1500)
    })
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isConnected = false
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
    setTimeout(
      () => {
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
      },
      1500 + Math.random() * 1000,
    ) // 1.5s - 2.5s delay
  }

  // --- AI Logic Simulation ---

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
    }
  }

  private simulateIncomingMessage() {
    const randomConv =
      this.conversations[Math.floor(Math.random() * this.conversations.length)]
    const msgs = [
      'Olá, ainda tem vaga?',
      'Não recebi meu link.',
      'Gostaria de falar com atendente.',
      'Obrigado!',
    ]
    const content = msgs[Math.floor(Math.random() * msgs.length)]

    this.sendMessage(randomConv.id, content, 'USUARIO')
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
