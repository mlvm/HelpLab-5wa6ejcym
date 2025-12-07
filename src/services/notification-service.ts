import { megaApi } from './mega-api'

export interface EmailConfig {
  host: string
  port: string
  username: string
  password: string
  fromEmail: string
  encryption: 'none' | 'ssl' | 'tls'
  enabled: boolean
}

export interface NotificationTemplate {
  id: string
  type: 'confirmation' | 'status_change' | 'general'
  name: string
  subject: string // Email subject
  content: string // Message content
}

export interface NotificationLog {
  id: string
  recipientName: string
  recipientContact: string // Phone or Email
  channel: 'whatsapp' | 'email'
  subject?: string
  content: string
  status: 'sent' | 'failed'
  sentAt: string
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
  host: 'smtp.example.com',
  port: '587',
  username: '',
  password: '',
  fromEmail: 'noreply@helplab.com.br',
  encryption: 'tls',
  enabled: false,
}

class NotificationService {
  private templates: NotificationTemplate[] = []
  private emailConfig: EmailConfig = DEFAULT_EMAIL_CONFIG
  private logs: NotificationLog[] = []

  constructor() {
    this.load()
  }

  private load() {
    try {
      const tpls = localStorage.getItem('helplab_templates')
      const email = localStorage.getItem('helplab_email_config')
      const history = localStorage.getItem('helplab_notification_logs')

      this.templates = tpls ? JSON.parse(tpls) : DEFAULT_TEMPLATES
      this.emailConfig = email ? JSON.parse(email) : DEFAULT_EMAIL_CONFIG
      this.logs = history ? JSON.parse(history) : []
    } catch (e) {
      console.error('Failed to load notification settings', e)
    }
  }

  private save() {
    localStorage.setItem('helplab_templates', JSON.stringify(this.templates))
    localStorage.setItem(
      'helplab_email_config',
      JSON.stringify(this.emailConfig),
    )
    localStorage.setItem('helplab_notification_logs', JSON.stringify(this.logs))
  }

  // --- Configuration ---

  getEmailConfig() {
    return { ...this.emailConfig }
  }

  saveEmailConfig(config: EmailConfig) {
    this.emailConfig = config
    this.save()
  }

  getTemplates() {
    return [...this.templates]
  }

  saveTemplate(template: NotificationTemplate) {
    const idx = this.templates.findIndex((t) => t.id === template.id)
    if (idx >= 0) {
      this.templates[idx] = template
    } else {
      this.templates.push(template)
    }
    this.save()
  }

  getTemplateByType(type: string) {
    return (
      this.templates.find((t) => t.type === type) ||
      DEFAULT_TEMPLATES.find((t) => t.type === type)
    )
  }

  // --- History ---

  getLogs() {
    return [...this.logs].sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
    )
  }

  logNotification(log: Omit<NotificationLog, 'id' | 'sentAt'>) {
    const newLog: NotificationLog = {
      ...log,
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      sentAt: new Date().toISOString(),
    }
    this.logs.unshift(newLog)
    this.save()
  }

  // --- Sending ---

  private render(template: string, variables: Record<string, any>) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return variables[key] !== undefined ? variables[key] : `{{${key}}}`
    })
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
    if (!template) {
      console.warn(`Template for ${type} not found`)
      return
    }

    const variables = {
      professionalName: data.professionalName,
      trainingName: data.trainingName,
      appointmentDate: data.appointmentDate,
      appointmentId: data.appointmentId || '',
      status: data.status || '',
    }

    const renderedContent = this.render(template.content, variables)
    const renderedSubject = this.render(template.subject, variables)

    // Send WhatsApp
    if (channels.whatsapp && data.professionalPhone) {
      try {
        const convId = await megaApi.findOrCreateConversation(
          data.professionalPhone,
          data.professionalName,
        )
        await megaApi.sendMessage(convId, renderedContent, 'BOT')

        this.logNotification({
          recipientName: data.professionalName,
          recipientContact: data.professionalPhone,
          channel: 'whatsapp',
          content: renderedContent,
          status: 'sent',
        })
      } catch (error) {
        console.error('Failed to send WhatsApp', error)
        this.logNotification({
          recipientName: data.professionalName,
          recipientContact: data.professionalPhone,
          channel: 'whatsapp',
          content: renderedContent,
          status: 'failed',
        })
      }
    }

    // Send Email
    if (channels.email && this.emailConfig.enabled && data.professionalEmail) {
      // Simulate Email Sending
      console.log(
        `[SMTP Mock] Sending email to ${data.professionalEmail} via ${this.emailConfig.host}`,
      )
      console.log(`Subject: ${renderedSubject}`)
      console.log(`Body: ${renderedContent}`)

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      this.logNotification({
        recipientName: data.professionalName,
        recipientContact: data.professionalEmail,
        channel: 'email',
        subject: renderedSubject,
        content: renderedContent,
        status: 'sent',
      })
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
        // Simulate Email
        if (!this.emailConfig.enabled) throw new Error('Email disabled')
        console.log(`[SMTP Mock] Adhoc email to ${recipientContact}`)
      }

      this.logNotification({
        recipientName,
        recipientContact,
        channel,
        content,
        subject,
        status: 'sent',
      })
      return true
    } catch (e) {
      console.error(e)
      this.logNotification({
        recipientName,
        recipientContact,
        channel,
        content,
        subject,
        status: 'failed',
      })
      return false
    }
  }
}

export const notificationService = new NotificationService()
