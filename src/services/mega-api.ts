import {
  WhatsappConversation,
  WhatsappMessage,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  ChatSender,
} from '@/pages/WhatsappPanel.data'
import { supabaseEdgeFunctions } from './supabase-edge-functions'

// Service simulating Mega API interactions with "Real" capabilities
// Updated to integrate with Supabase Edge Functions for ChatGPT/Gemini responses

export type AIProvider = 'chatgpt' | 'gemini'

class MegaApiService {
  private apiKey: string | null = null
  private webhookUrl: string | null = null
  private openaiApiKey: string | null = null
  private geminiApiKey: string | null = null
  private aiProvider: AIProvider = 'chatgpt'
  private aiModel: string = 'gpt-4o-mini'

  private isConnected = false
  private conversations: WhatsappConversation[] = []
  private messages: Record<string, WhatsappMessage[]> = {}
  private listeners: ((data: any) => void)[] = []
  private pollingInterval: NodeJS.Timeout | null = null

  constructor() {
    // Load persisted config (Simulating Supabase Secrets/Vault fetch)
    const storedKey = localStorage.getItem('mega_api_key')
    const storedUrl = localStorage.getItem('mega_webhook_url')
    const storedOpenAiKey = localStorage.getItem('openai_api_key')
    const storedGeminiKey = localStorage.getItem('gemini_api_key')
    const storedProvider = localStorage.getItem('ai_provider') as AIProvider
    const storedModel = localStorage.getItem('ai_model')

    if (storedKey) this.apiKey = storedKey
    if (storedUrl) this.webhookUrl = storedUrl
    if (storedOpenAiKey) this.openaiApiKey = storedOpenAiKey
    if (storedGeminiKey) this.geminiApiKey = storedGeminiKey
    if (storedProvider) this.aiProvider = storedProvider
    if (storedModel) this.aiModel = storedModel

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
    openaiApiKey: string,
    geminiApiKey: string,
    aiProvider: AIProvider,
    aiModel: string,
  ): Promise<boolean> {
    // Simulate secure storage
    return new Promise((resolve) => {
      setTimeout(() => {
        this.apiKey = apiKey
        this.webhookUrl = webhookUrl
        this.openaiApiKey = openaiApiKey
        this.geminiApiKey = geminiApiKey
        this.aiProvider = aiProvider
        this.aiModel = aiModel

        localStorage.setItem('mega_api_key', apiKey)
        localStorage.setItem('mega_webhook_url', webhookUrl)
        localStorage.setItem('openai_api_key', openaiApiKey)
        localStorage.setItem('gemini_api_key', geminiApiKey)
        localStorage.setItem('ai_provider', aiProvider)
        localStorage.setItem('ai_model', aiModel)

        resolve(true)
      }, 800)
    })
  }

  getCredentials() {
    return {
      apiKey: this.apiKey,
      webhookUrl: this.webhookUrl,
      openaiApiKey: this.openaiApiKey,
      geminiApiKey: this.geminiApiKey,
      aiProvider: this.aiProvider,
      aiModel: this.aiModel,
    }
  }

  // --- Connection ---

  async testConnection(key: string): Promise<boolean> {
    console.log('Testing connection with key:', key)
    // Simulate an API Health Check call
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
            sender === 'USUARIO'
              ? `Processando com ${this.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}...`
              : undefined,
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

        // Trigger AI Response via Edge Function if User sent message
        if (sender === 'USUARIO') {
          this.triggerBotResponse(conversationId, content)
        }
      }, 500)
    })
  }

  private async triggerBotResponse(
    conversationId: string,
    userContent: string,
  ) {
    // Check for appropriate API key based on provider
    const hasKey =
      this.aiProvider === 'gemini' ? !!this.geminiApiKey : !!this.openaiApiKey

    if (!hasKey) {
      console.warn(
        `${this.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API Key missing. Bot cannot reply.`,
      )
      return
    }

    try {
      // Call Supabase Edge Function to get AI response
      const aiResponse = await supabaseEdgeFunctions.invokeAI(
        userContent,
        this.aiProvider,
        this.aiModel,
      )

      const botMessage: WhatsappMessage = {
        id: `m${Date.now()}_bot`,
        conversaId: conversationId,
        remetente: 'BOT',
        conteudo: aiResponse.text,
        criadoEm: new Date().toISOString(),
        acaoExecutadaPeloBot: aiResponse.action
          ? `${this.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}: ${aiResponse.action}`
          : 'Resposta Gerada',
        intencaoDetectada: `Modelo: ${aiResponse.model}`,
      }

      this.messages[conversationId].push(botMessage)
      this.updateConversationPreview(conversationId, botMessage)
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to get AI response:', error)
      // Fallback error message
      const errorMessage: WhatsappMessage = {
        id: `m${Date.now()}_err`,
        conversaId: conversationId,
        remetente: 'BOT',
        conteudo:
          'Desculpe, estou enfrentando dificuldades técnicas para processar sua mensagem no momento.',
        criadoEm: new Date().toISOString(),
        acaoExecutadaPeloBot: 'Erro: Falha na Edge Function',
      }
      this.messages[conversationId].push(errorMessage)
      this.updateConversationPreview(conversationId, errorMessage)
      this.notifyListeners()
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
      'Olá, ainda tem vaga para o curso?',
      'Gostaria de cancelar minha inscrição.',
      'O certificado demora quanto tempo?',
      'Qual o valor do treinamento?',
      'Vocês tem curso de gestão?',
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
