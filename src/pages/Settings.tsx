import { useState, useEffect } from 'react'
import {
  Save,
  Loader2,
  Key,
  Server,
  Shield,
  Bot,
  Cpu,
  Zap,
  Play,
  AlertTriangle,
  Mail,
  MessageSquare,
  Edit,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  megaApi,
  AIProvider,
  UsageLimits,
  TestResult,
} from '@/services/mega-api'
import {
  notificationService,
  EmailConfig,
  NotificationTemplate,
} from '@/services/notification-service'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const CHATGPT_MODELS = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    desc: 'Rápido e econômico, ideal para respostas diretas.',
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    desc: 'Mais inteligente e capaz, ideal para raciocínio complexo.',
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    desc: 'Modelo clássico, alta velocidade.',
  },
]

const GEMINI_MODELS = [
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    desc: 'Extremamente rápido e eficiente para alto volume.',
  },
  {
    id: 'gemini-pro',
    name: 'Gemini Pro',
    desc: 'Equilíbrio entre performance e velocidade.',
  },
  {
    id: 'gemini-ultra',
    name: 'Gemini Ultra',
    desc: 'Modelo mais avançado para tarefas complexas.',
  },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('integrations')

  // Mega & AI Config
  const [megaApiKey, setMegaApiKey] = useState('')
  const [megaWebhookUrl, setMegaWebhookUrl] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [aiProvider, setAiProvider] = useState<AIProvider>('chatgpt')
  const [aiModel, setAiModel] = useState('gpt-4o-mini')
  const [systemPrompt, setSystemPrompt] = useState(
    'Você é um assistente útil e amigável.',
  )
  const [limits, setLimits] = useState<Record<AIProvider, UsageLimits>>({
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
  })

  // Email Config
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    host: '',
    port: '',
    username: '',
    password: '',
    fromEmail: '',
    encryption: 'tls',
    enabled: false,
  })

  // Templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [editingTemplate, setEditingTemplate] =
    useState<NotificationTemplate | null>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load AI/Mega Config
    const creds = megaApi.getCredentials()
    if (creds.apiKey) setMegaApiKey(creds.apiKey)
    if (creds.webhookUrl) setMegaWebhookUrl(creds.webhookUrl)
    if (creds.openaiApiKey) setOpenaiApiKey(creds.openaiApiKey)
    if (creds.geminiApiKey) setGeminiApiKey(creds.geminiApiKey)
    if (creds.aiProvider) setAiProvider(creds.aiProvider)
    if (creds.aiModel) setAiModel(creds.aiModel)
    if (creds.systemPrompt) setSystemPrompt(creds.systemPrompt)
    if (creds.limits) setLimits(creds.limits)

    // Load Email & Templates
    setEmailConfig(notificationService.getEmailConfig())
    setTemplates(notificationService.getTemplates())
  }, [])

  useEffect(() => {
    if (aiProvider === 'chatgpt') {
      const isValid = CHATGPT_MODELS.some((m) => m.id === aiModel)
      if (!isValid) setAiModel(CHATGPT_MODELS[0].id)
    } else {
      const isValid = GEMINI_MODELS.some((m) => m.id === aiModel)
      if (!isValid) setAiModel(GEMINI_MODELS[0].id)
    }
  }, [aiProvider, aiModel])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (activeTab === 'integrations') {
        if (!megaApiKey || !megaWebhookUrl) {
          throw new Error('Mega API fields are required')
        }
        await megaApi.updateConfiguration(
          megaApiKey,
          megaWebhookUrl,
          openaiApiKey,
          geminiApiKey,
          aiProvider,
          aiModel,
          systemPrompt,
          limits,
        )
        toast({ title: 'Configurações de IA salvas com sucesso.' })
      } else if (activeTab === 'email') {
        notificationService.saveEmailConfig(emailConfig)
        toast({ title: 'Configurações de Email salvas com sucesso.' })
      } else if (activeTab === 'templates') {
        // Templates are saved individually via dialog
        toast({ title: 'Modelos gerenciados individualmente.' })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Verifique os campos obrigatórios.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTemplate = () => {
    if (editingTemplate) {
      notificationService.saveTemplate(editingTemplate)
      setTemplates(notificationService.getTemplates())
      setEditingTemplate(null)
      toast({ title: 'Modelo atualizado com sucesso.' })
    }
  }

  const handleRunTest = async () => {
    setIsTesting(true)
    setTestResults([])
    try {
      await megaApi.updateConfiguration(
        megaApiKey,
        megaWebhookUrl,
        openaiApiKey,
        geminiApiKey,
        aiProvider,
        aiModel,
        systemPrompt,
        limits,
      )
      const results = await megaApi.runComparativeTest()
      setTestResults(results)
      toast({
        title: 'Teste Concluído',
        description: 'Métricas de performance atualizadas.',
      })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro no teste',
        description: 'Não foi possível executar o teste comparativo.',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const calculateMonthlyCost = (provider: AIProvider) => {
    const l = limits[provider]
    const totalInput = l.monthlyInteractions * l.averageInputTokens
    const totalOutput = l.monthlyInteractions * l.averageOutputTokens
    const costInput = (totalInput / 1000000) * l.costPerMillionInputTokens
    const costOutput = (totalOutput / 1000000) * l.costPerMillionOutputTokens
    return (costInput + costOutput).toFixed(2)
  }

  const activeModelDesc =
    aiProvider === 'chatgpt'
      ? CHATGPT_MODELS.find((m) => m.id === aiModel)?.desc
      : GEMINI_MODELS.find((m) => m.id === aiModel)?.desc

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie integrações, notificações e inteligência artificial.
          </p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="integrations">Integrações & IA</TabsTrigger>
          <TabsTrigger value="email">Email & SMTP</TabsTrigger>
          <TabsTrigger value="templates">Modelos de Mensagem</TabsTrigger>
        </TabsList>

        {/* --- INTEGRATIONS TAB --- */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <CardTitle>Mega API (WhatsApp)</CardTitle>
              </div>
              <CardDescription>
                Gateway de mensagens para envio e recebimento via WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key da Mega</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="mega_live_..."
                    className="pl-9"
                    value={megaApiKey}
                    onChange={(e) => setMegaApiKey(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://api.helplab.com.br/webhooks/whatsapp"
                  value={megaWebhookUrl}
                  onChange={(e) => setMegaWebhookUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Settings */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  <CardTitle>Inteligência Artificial</CardTitle>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded border border-blue-200">
                  Supabase Edge Function
                </div>
              </div>
              <CardDescription>
                Escolha o provedor e o modelo para o chatbot.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-3">
                <Label className="text-base">Provedor de IA</Label>
                <RadioGroup
                  value={aiProvider}
                  onValueChange={(v) => setAiProvider(v as AIProvider)}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <div>
                    <RadioGroupItem
                      value="chatgpt"
                      id="chatgpt"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="chatgpt"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                    >
                      <Shield className="mb-3 h-6 w-6 text-green-600" />
                      <div className="text-center">
                        <div className="font-semibold">ChatGPT (OpenAI)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Líder em raciocínio e criatividade
                        </div>
                      </div>
                    </Label>
                  </div>
                  <div>
                    <RadioGroupItem
                      value="gemini"
                      id="gemini"
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor="gemini"
                      className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer h-full"
                    >
                      <Cpu className="mb-3 h-6 w-6 text-purple-600" />
                      <div className="text-center">
                        <div className="font-semibold">Gemini (Google)</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Alta velocidade e multimodelo
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Dynamic API Key Input */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="ai-key">
                  {aiProvider === 'chatgpt'
                    ? 'OpenAI API Key'
                    : 'Google Gemini API Key'}
                </Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="ai-key"
                    type="password"
                    placeholder={
                      aiProvider === 'chatgpt' ? 'sk-...' : 'AIza...'
                    }
                    className="pl-9"
                    value={
                      aiProvider === 'chatgpt' ? openaiApiKey : geminiApiKey
                    }
                    onChange={(e) =>
                      aiProvider === 'chatgpt'
                        ? setOpenaiApiKey(e.target.value)
                        : setGeminiApiKey(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2 animate-fade-in">
                <Label>Modelo Selecionado</Label>
                <Select value={aiModel} onValueChange={setAiModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiProvider === 'chatgpt'
                      ? CHATGPT_MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))
                      : GEMINI_MODELS.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
                {activeModelDesc && (
                  <div className="flex items-start gap-2 mt-2 bg-muted/30 p-3 rounded text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 mt-0.5 text-yellow-500 shrink-0" />
                    {activeModelDesc}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Comparative Testing */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  <CardTitle>Teste Comparativo de IA</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRunTest}
                  disabled={isTesting}
                >
                  {isTesting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Executar Teste
                </Button>
              </div>
              <CardDescription>
                Compare latência e custo entre os provedores configurados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {testResults.map((result) => (
                      <div
                        key={result.provider}
                        className={cn(
                          'border rounded-lg p-4',
                          result.success
                            ? 'bg-green-50/50 border-green-200'
                            : 'bg-red-50/50 border-red-200',
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold uppercase flex items-center gap-2">
                            {result.provider === 'gemini' ? (
                              <Cpu className="h-4 w-4 text-purple-600" />
                            ) : (
                              <Shield className="h-4 w-4 text-green-600" />
                            )}
                            {result.provider}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {result.model}
                          </span>
                        </div>
                        {result.success ? (
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                Latência
                              </span>
                              <span className="font-mono font-medium">
                                {result.latency}ms
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">
                                Tokens Totais
                              </span>
                              <span className="font-mono font-medium">
                                {result.tokens}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600 mt-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" />
                            {result.error || 'Falha desconhecida'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm border-dashed border-2 rounded-lg">
                  Clique em "Executar Teste" para comparar os modelos.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- EMAIL TAB --- */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  <CardTitle>Configuração SMTP</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={emailConfig.enabled}
                    onCheckedChange={(checked) =>
                      setEmailConfig((prev) => ({ ...prev, enabled: checked }))
                    }
                  />
                  <Label>Ativar Email</Label>
                </div>
              </div>
              <CardDescription>
                Configure os detalhes do servidor de email para notificações.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SMTP Host</Label>
                  <Input
                    placeholder="smtp.exemplo.com"
                    value={emailConfig.host}
                    onChange={(e) =>
                      setEmailConfig((prev) => ({
                        ...prev,
                        host: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>SMTP Port</Label>
                  <Input
                    placeholder="587"
                    value={emailConfig.port}
                    onChange={(e) =>
                      setEmailConfig((prev) => ({
                        ...prev,
                        port: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Usuário</Label>
                  <Input
                    placeholder="usuario@exemplo.com"
                    value={emailConfig.username}
                    onChange={(e) =>
                      setEmailConfig((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={emailConfig.password}
                    onChange={(e) =>
                      setEmailConfig((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email do Remetente</Label>
                  <Input
                    placeholder="no-reply@helplab.com"
                    value={emailConfig.fromEmail}
                    onChange={(e) =>
                      setEmailConfig((prev) => ({
                        ...prev,
                        fromEmail: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Criptografia</Label>
                  <Select
                    value={emailConfig.encryption}
                    onValueChange={(val: any) =>
                      setEmailConfig((prev) => ({ ...prev, encryption: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="tls">TLS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TEMPLATES TAB --- */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <CardTitle>Modelos de Mensagem</CardTitle>
              </div>
              <CardDescription>
                Personalize as mensagens enviadas por WhatsApp e Email.
                Variáveis disponíveis: {'{{professionalName}}'},{' '}
                {'{{appointmentDate}}'}, {'{{trainingName}}'}, {'{{status}}'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Assunto (Email)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {template.type === 'confirmation'
                            ? 'Confirmação'
                            : 'Status'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {template.subject}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTemplate(template)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Template Dialog */}
      <Dialog
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Modelo</DialogTitle>
            <DialogDescription>
              Edite o conteúdo do modelo. Use as variáveis dinâmicas conforme
              necessário.
            </DialogDescription>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <Input
                  value={editingTemplate.name}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Assunto (Apenas Email)</Label>
                <Input
                  value={editingTemplate.subject}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      subject: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Conteúdo da Mensagem</Label>
                <Textarea
                  className="h-32 font-mono text-sm"
                  value={editingTemplate.content}
                  onChange={(e) =>
                    setEditingTemplate({
                      ...editingTemplate,
                      content: e.target.value,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Variáveis: {'{{professionalName}}'}, {'{{appointmentDate}}'},{' '}
                  {'{{trainingName}}'}, {'{{status}}'}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTemplate(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveTemplate}>Salvar Modelo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
