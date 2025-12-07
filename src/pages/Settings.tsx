import { useState, useEffect } from 'react'
import { Save, Loader2, Key, Server, Shield, Bot, Cpu, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { megaApi, AIProvider } from '@/services/mega-api'

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
  const [megaApiKey, setMegaApiKey] = useState('')
  const [megaWebhookUrl, setMegaWebhookUrl] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [geminiApiKey, setGeminiApiKey] = useState('')
  const [aiProvider, setAiProvider] = useState<AIProvider>('chatgpt')
  const [aiModel, setAiModel] = useState('gpt-4o-mini')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const creds = megaApi.getCredentials()
    if (creds.apiKey) setMegaApiKey(creds.apiKey)
    if (creds.webhookUrl) setMegaWebhookUrl(creds.webhookUrl)
    if (creds.openaiApiKey) setOpenaiApiKey(creds.openaiApiKey)
    if (creds.geminiApiKey) setGeminiApiKey(creds.geminiApiKey)
    if (creds.aiProvider) setAiProvider(creds.aiProvider)
    if (creds.aiModel) setAiModel(creds.aiModel)
  }, [])

  // Reset model when provider changes if current model doesn't belong to provider
  useEffect(() => {
    if (aiProvider === 'chatgpt') {
      const isValid = CHATGPT_MODELS.some((m) => m.id === aiModel)
      if (!isValid) setAiModel(CHATGPT_MODELS[0].id)
    } else {
      const isValid = GEMINI_MODELS.some((m) => m.id === aiModel)
      if (!isValid) setAiModel(GEMINI_MODELS[0].id)
    }
  }, [aiProvider]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (!megaApiKey || !megaWebhookUrl) {
        toast({
          variant: 'destructive',
          title: 'Campos obrigatórios',
          description: 'As credenciais da Mega API são fundamentais.',
        })
        setIsLoading(false)
        return
      }

      if (aiProvider === 'chatgpt' && !openaiApiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Necessária',
          description: 'Para usar ChatGPT, informe a OpenAI API Key.',
        })
        setIsLoading(false)
        return
      }

      if (aiProvider === 'gemini' && !geminiApiKey) {
        toast({
          variant: 'destructive',
          title: 'API Key Necessária',
          description: 'Para usar Gemini, informe a Google API Key.',
        })
        setIsLoading(false)
        return
      }

      // Test connection
      await megaApi.testConnection(megaApiKey)

      // Save all
      await megaApi.updateConfiguration(
        megaApiKey,
        megaWebhookUrl,
        openaiApiKey,
        geminiApiKey,
        aiProvider,
        aiModel,
      )

      toast({
        title: 'Configurações salvas',
        description: 'Sistema atualizado com sucesso.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Falha na validação das credenciais.',
      })
    } finally {
      setIsLoading(false)
    }
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
            Gerencie as integrações, chaves de API e inteligência artificial.
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

      <Tabs defaultValue="integrations" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="integrations">Integrações & IA</TabsTrigger>
          <TabsTrigger value="account">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6 mt-6">
          {/* Mega API Configuration */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                <CardTitle>Mega API (WhatsApp)</CardTitle>
              </div>
              <CardDescription>
                Gateway de mensagens para envio e recebimento.
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
                Escolha o provedor e o modelo que responderá aos usuários.
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
                <p className="text-[0.8rem] text-muted-foreground">
                  {aiProvider === 'chatgpt'
                    ? 'Chave segura para acessar modelos GPT.'
                    : 'Chave segura para acessar modelos Gemini.'}
                </p>
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

              <Alert className="bg-slate-50 border-slate-200">
                <Shield className="h-4 w-4 text-slate-600" />
                <AlertTitle className="text-slate-700">
                  Armazenamento Seguro
                </AlertTitle>
                <AlertDescription className="text-slate-600">
                  Suas chaves são armazenadas localmente nesta demonstração e
                  seriam encriptadas no Vault em produção.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                Alterações no provedor ou modelo entram em vigor imediatamente
                para novas mensagens.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Gerencie suas informações de conta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                Configurações de conta indisponíveis nesta demonstração.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
