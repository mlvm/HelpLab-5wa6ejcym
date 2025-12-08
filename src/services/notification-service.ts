import { megaApi } from './mega-api'
import { supabase } from '@/lib/supabase/client'
import { Communication } from '@/types/db-types'

export interface NotificationTemplate {
  id: string
  type: 'confirmation' | 'status_change' | 'general'
  name: string
  subject: string
  content: string
}

export interface EmailConfig {
  host: string
  port: string
  username: string
  password: string
  fromEmail: string
  encryption: 'none' | 'ssl' | 'tls'
  enabled: boolean
}

const DEFAULT_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl_conf',
    type: 'confirmation',
    name: 'Confirmação de Agendamento',
    subject: 'Confirmação: {{trainingName}}',
    content:
      'Olá {{professionalName}}, seu agendamento para o treinamento "{{trainingName}}" no dia {{appointmentDate}} foi confirmado com sucesso! Protocolo: #{{appointmentId}}.',
  },
  {
    id: 'tpl_status',
    type: 'status_change',
    name: 'Alteração de Status',
    subject: 'Atualização de Status: {{trainingName}}',
    content:
      'Olá {{professionalName}}, o status do seu agendamento para "{{trainingName}}" ({appointmentDate}) foi alterado para: {{status}}.',
  },
]

const DEFAULT_EMAIL_CONFIG: EmailConfig = {
  host: '',
  port: '',
  username: '',
  password: '',
  fromEmail: '',
  encryption: 'tls',
  enabled: false,
}

class NotificationService {
  private templates: NotificationTemplate[] = DEFAULT_TEMPLATES
  private emailConfig: EmailConfig = DEFAULT_EMAIL_CONFIG

  constructor() {
    this.loadSettings()
  }

  private loadSettings() {
    const savedTemplates = localStorage.getItem('notification_templates')
    if (savedTemplates) {
      try {
        this.templates = JSON.parse(savedTemplates)
      } catch (e) {
        console.error('Failed to parse templates', e)
      }
    }

    const savedEmail = localStorage.getItem('email_config')
    if (savedEmail) {
      try {
        this.emailConfig = JSON.parse(savedEmail)
      } catch (e) {
        console.error('Failed to parse email config', e)
      }
    }
  }

  // --- Configuration Methods ---

  getTemplates() {
    return this.templates
  }

  saveTemplate(template: NotificationTemplate) {
    const index = this.templates.findIndex((t) => t.id === template.id)
    if (index >= 0) {
      this.templates[index] = template
    } else {
      this.templates.push(template)
    }
    localStorage.setItem(
      'notification_templates',
      JSON.stringify(this.templates),
    )
  }

  getEmailConfig() {
    return this.emailConfig
  }

  saveEmailConfig(config: EmailConfig) {
    this.emailConfig = config
    localStorage.setItem('email_config', JSON.stringify(config))
  }

  // --- History (Now Communications) ---

  async getLogs(): Promise<Communication[]> {
    const { data, error } = await supabase
      .from('communications')
      .select('*')
      .order('sent_at', { ascending: false })

    if (error) return []
    return data as Communication[]
  }

  async logNotification(log: {
    recipientName: string
    recipientContact: string
    channel: string
    content: string
    status: string
  }) {
    await supabase.from('communications').insert({
      recipient_name: log.recipientName,
      recipient_contact: log.recipientContact,
      channel: log.channel,
      content: log.content,
      status: log.status,
    })
  }

  // --- Sending ---

  private render(template: string, variables: Record<string, any>) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? variables[key] : `{{${key}}}`
    })
  }

  getTemplateByType(type: string) {
    return this.templates.find((t) => t.type === type)
  }

  async sendNotification(
    type: 'confirmation' | 'status_change',
    data: {
      professionalName: string
      professionalPhone?: string
      professionalEmail?: string
      trainingName: string
      appointmentDate: string
      appointmentId?: string | number
      status?: string
    },
    channels: { whatsapp?: boolean; email?: boolean } = {
      whatsapp: true,
      email: true,
    },
  ) {
    const template = this.getTemplateByType(type)
    if (!template) return

    const variables = {
      professionalName: data.professionalName,
      trainingName: data.trainingName,
      appointmentDate: data.appointmentDate,
      appointmentId: data.appointmentId || '',
      status: data.status || '',
    }

    const renderedContent = this.render(template.content, variables)

    if (channels.whatsapp && data.professionalPhone) {
      try {
        const convId = await megaApi.findOrCreateConversation(
          data.professionalPhone,
          data.professionalName,
        )
        await megaApi.sendMessage(convId, renderedContent, 'BOT')

        // Logging is done inside sendMessage for BOT, but we double check here if needed.
        // Actually sendMessage logs it, so we might skip duplicate log or rely on it.
        // For safety/consistency with existing code:
        /* 
        await this.logNotification({
          recipientName: data.professionalName,
          recipientContact: data.professionalPhone,
          channel: 'whatsapp',
          content: renderedContent,
          status: 'sent',
        })
        */
      } catch (error) {
        await this.logNotification({
          recipientName: data.professionalName,
          recipientContact: data.professionalPhone || '',
          channel: 'whatsapp',
          content: renderedContent,
          status: 'failed',
        })
      }
    }
  }

  async sendAdhocMessage(
    recipientName: string,
    recipientContact: string,
    channel: 'whatsapp' | 'email',
    content: string,
    subject?: string,
  ) {
    try {
      if (channel === 'whatsapp') {
        const convId = await megaApi.findOrCreateConversation(
          recipientContact,
          recipientName,
        )
        await megaApi.sendMessage(convId, content, 'BOT')
      } else {
        // Email simulation
      }

      await this.logNotification({
        recipientName,
        recipientContact,
        channel,
        content,
        status: 'sent',
      })
      return true
    } catch (e) {
      await this.logNotification({
        recipientName,
        recipientContact,
        channel,
        content,
        status: 'failed',
      })
      return false
    }
  }
}

export const notificationService = new NotificationService()
