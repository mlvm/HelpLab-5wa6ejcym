import {
  WhatsappConversation,
  WhatsappMessage,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  ChatSender,
} from '@/pages/WhatsappPanel.data'
import { supabaseEdgeFunctions, AIResponse } from './supabase-edge-functions'
import { db } from './database'

export type AIProvider = 'chatgpt' | 'gemini'

export interface UsageLimits {
  monthlyInteractions: number
  tokensPerResponse: number
  averageInputTokens: number
  averageOutputTokens: number
  costPerMillionInputTokens: number
  costPerMillionOutputTokens: number
}

export interface TestResult {
  provider: AIProvider
  model: string
  latency: number
  tokens: number
  success: boolean
  error?: string
}

class MegaApiService {
  private apiKey: string | null = null
  private webhookUrl: string | null = null
  private openaiApiKey: string | null = null
  private geminiApiKey: string | null = null
  private aiProvider: AIProvider = 'chatgpt'
  private aiModel: string = 'gpt-4o-mini'
  private systemPrompt: string = ''
  private limits: Record<AIProvider, UsageLimits> = {
    chatgpt: {
      monthlyInteractions: 1000,
      tokensPerResponse: 4096,
      averageInputTokens: 500,
      averageOutputTokens: 300,
      costPerMillionInputTokens: 0.15,
      costPerMillionOutputTokens: 0.6,
    },
    gemini: {
      monthlyInteractions: 1000,
      tokensPerResponse: 4096,
      averageInputTokens: 500,
      averageOutputTokens: 300,
      costPerMillionInputTokens: 0.075,
      costPerMillionOutputTokens: 0.3,
    },
  }

  private isConnected = false
  private conversations: WhatsappConversation[] = []
  private messages: Record<string, WhatsappMessage[]> = {}
  private listeners: ((data: any) => void)[] = []
  private pollingInterval: NodeJS.Timeout | null = null

  constructor() {
    // Load persisted config
    const storedKey = localStorage.getItem('mega_api_key')
    const storedUrl = localStorage.getItem('mega_webhook_url')
    const storedOpenAiKey = localStorage.getItem('openai_api_key')
    const storedGeminiKey = localStorage.getItem('gemini_api_key')
    const storedProvider = localStorage.getItem('ai_provider') as AIProvider
    const storedModel = localStorage.getItem('ai_model')
    const storedPrompt = localStorage.getItem('ai_system_prompt')
    const storedLimits = localStorage.getItem('ai_usage_limits')

    if (storedKey) this.apiKey = storedKey
    if (storedUrl) this.webhookUrl = storedUrl
    if (storedOpenAiKey) this.openaiApiKey = storedOpenAiKey
    if (storedGeminiKey) this.geminiApiKey = storedGeminiKey
    if (storedProvider) this.aiProvider = storedProvider
    if (storedModel) this.aiModel = storedModel
    if (storedPrompt) this.systemPrompt = storedPrompt
    if (storedLimits) {
      try {
        const parsed = JSON.parse(storedLimits)
        if (parsed.chatgpt) {
          this.limits.chatgpt = { ...this.limits.chatgpt, ...parsed.chatgpt }
        }
        if (parsed.gemini) {
          this.limits.gemini = { ...this.limits.gemini, ...parsed.gemini }
        }
      } catch (e) {
        console.error('Failed to parse usage limits', e)
      }
    }

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
    systemPrompt: string,
    limits: Record<AIProvider, UsageLimits>,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.apiKey = apiKey
        this.webhookUrl = webhookUrl
        this.openaiApiKey = openaiApiKey
        this.geminiApiKey = geminiApiKey
        this.aiProvider = aiProvider
        this.aiModel = aiModel
        this.systemPrompt = systemPrompt
        this.limits = limits

        localStorage.setItem('mega_api_key', apiKey)
        localStorage.setItem('mega_webhook_url', webhookUrl)
        localStorage.setItem('openai_api_key', openaiApiKey)
        localStorage.setItem('gemini_api_key', geminiApiKey)
        localStorage.setItem('ai_provider', aiProvider)
        localStorage.setItem('ai_model', aiModel)
        localStorage.setItem('ai_system_prompt', systemPrompt)
        localStorage.setItem('ai_usage_limits', JSON.stringify(limits))

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
      systemPrompt: this.systemPrompt,
      limits: this.limits,
    }
  }

  // --- Connection ---

  async testConnection(key: string): Promise<boolean> {
    console.log('Testing connection with key:', key)
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

  async runComparativeTest(): Promise<TestResult[]> {
    const results: TestResult[] = []
    const testPrompt = 'Olá, isso é um teste de performance.'

    // Test ChatGPT
    if (this.openaiApiKey) {
      try {
        const response = await supabaseEdgeFunctions.invokeAI(
          testPrompt,
          'chatgpt',
          'gpt-4o-mini',
          this.systemPrompt,
        )
        results.push({
          provider: 'chatgpt',
          model: 'gpt-4o-mini',
          latency: response.latency,
          tokens: response.usage.total_tokens,
          success: true,
        })
      } catch (e) {
        results.push({
          provider: 'chatgpt',
          model: 'gpt-4o-mini',
          latency: 0,
          tokens: 0,
          success: false,
          error: 'Connection Failed',
        })
      }
    }

    // Test Gemini
    if (this.geminiApiKey) {
      try {
        const response = await supabaseEdgeFunctions.invokeAI(
          testPrompt,
          'gemini',
          'gemini-1.5-flash',
          this.systemPrompt,
        )
        results.push({
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          latency: response.latency,
          tokens: response.usage.total_tokens,
          success: true,
        })
      } catch (e) {
        results.push({
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          latency: 0,
          tokens: 0,
          success: false,
          error: 'Connection Failed',
        })
      }
    }

    return results
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

  async findOrCreateConversation(
    phoneNumber: string,
    contactName: string,
  ): Promise<string> {
    const existing = this.conversations.find((c) => c.telefone === phoneNumber)
    if (existing) return existing.id

    const newId = `c_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    const newConv: WhatsappConversation = {
      id: newId,
      telefone: phoneNumber,
      profissionalNome: contactName,
      ultimaMensagemPreview: '',
      ultimaMensagemEm: new Date().toISOString(),
      status: 'OUTRO', // Default status
      origem: 'WHATSAPP',
      unreadCount: 0,
    }
    this.conversations.unshift(newConv)
    this.messages[newId] = []
    this.notifyListeners()
    return newId
  }

  async sendAppointmentConfirmation(
    phoneNumber: string,
    professionalName: string,
    training: string,
    date: string,
  ) {
    if (!phoneNumber) return

    // Ensure connection is simulated if not explicit
    if (!this.isConnected) {
      // Auto-connect for this action for demo purposes if not connected
      this.isConnected = true
    }

    const conversationId = await this.findOrCreateConversation(
      phoneNumber,
      professionalName,
    )
    const message = `Olá ${professionalName}, seu agendamento para o treinamento "${training}" no dia ${date} foi confirmado com sucesso!`
    await this.sendMessage(conversationId, message, 'BOT')
  }

  async sendStatusUpdateNotification(
    phoneNumber: string,
    professionalName: string,
    training: string,
    date: string,
    status: string,
  ) {
    if (!phoneNumber) return

    if (!this.isConnected) {
      this.isConnected = true
    }

    const conversationId = await this.findOrCreateConversation(
      phoneNumber,
      professionalName,
    )
    const message = `Olá ${professionalName}, o status do seu agendamento para "${training}" (${date}) foi alterado para: ${status}.`
    await this.sendMessage(conversationId, message, 'BOT')
  }

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

        if (!this.messages[conversationId]) {
          this.messages[conversationId] = []
        }
        this.messages[conversationId].push(newMessage)

        this.updateConversationPreview(conversationId, newMessage)

        this.notifyListeners()
        resolve(newMessage)

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
    const hasKey =
      this.aiProvider === 'gemini' ? !!this.geminiApiKey : !!this.openaiApiKey

    if (!hasKey) {
      console.warn(
        `${this.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'} API Key missing. Bot cannot reply.`,
      )
      return
    }

    const limit = this.limits[this.aiProvider]

    try {
      const aiResponse = await supabaseEdgeFunctions.invokeAI(
        userContent,
        this.aiProvider,
        this.aiModel,
        this.systemPrompt,
      )

      if (limit && aiResponse.usage.total_tokens > limit.tokensPerResponse) {
        throw new Error('Token limit exceeded for this response.')
      }

      // --- USER STORY IMPLEMENTATION ---
      // Check if AI extracted data for appointment creation
      let finalBotText = aiResponse.text
      let finalAction = aiResponse.action

      if (aiResponse.extracted_data) {
        try {
          const { professional, appointment } = aiResponse.extracted_data

          // 1. Check & Update/Create Professional
          const prof = db.upsertProfessional(professional)

          // 2. Create Appointment
          const appt = db.createAppointment({
            professionalId: prof.id,
            profName: prof.name,
            training: appointment.training,
            date: appointment.date,
            channel: 'WhatsApp',
            status: 'Agendado',
          })

          // Send confirmation via WhatsApp logic is inherent here as this IS the chat bot response
          // But we can also trigger the formal notification method if we wanted to enforce template
          // For now, the bot response confirms it.

          finalBotText += `\n\n✅ Agendamento #${appt.id} confirmado para ${appt.prof} no dia ${appt.date}!`
          finalAction = 'Agendamento Criado no Banco de Dados'
        } catch (dbError) {
          console.error('Database operation failed', dbError)
          finalBotText += `\n\n⚠️ Falha ao salvar no banco de dados.`
          finalAction = 'Erro de Banco de Dados'
        }
      }
      // ---------------------------------

      const botMessage: WhatsappMessage = {
        id: `m${Date.now()}_bot`,
        conversaId: conversationId,
        remetente: 'BOT',
        conteudo: finalBotText,
        criadoEm: new Date().toISOString(),
        acaoExecutadaPeloBot: finalAction
          ? `${this.aiProvider === 'gemini' ? 'Gemini' : 'ChatGPT'}: ${finalAction}`
          : 'Resposta Gerada',
        intencaoDetectada: `Modelo: ${aiResponse.model}`,
        aiProvider: aiResponse.provider,
        aiModel: aiResponse.model,
        aiUsage: {
          promptTokens: aiResponse.usage.prompt_tokens,
          completionTokens: aiResponse.usage.completion_tokens,
          totalTokens: aiResponse.usage.total_tokens,
          latency: aiResponse.latency,
        },
      }

      this.messages[conversationId].push(botMessage)
      this.updateConversationPreview(conversationId, botMessage)
      this.notifyListeners()
    } catch (error) {
      console.error('Failed to get AI response:', error)
      const errorMessage: WhatsappMessage = {
        id: `m${Date.now()}_err`,
        conversaId: conversationId,
        remetente: 'BOT',
        conteudo:
          'Desculpe, não consegui processar sua mensagem devido a limites de uso ou erro técnico.',
        criadoEm: new Date().toISOString(),
        acaoExecutadaPeloBot: 'Erro: Falha na IA/Limites',
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
