import { useState, useEffect } from 'react'
import { Save, Loader2, CheckCircle2, Key, Server, Shield } from 'lucide-react'
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
import { megaApi } from '@/services/mega-api'

export default function Settings() {
  const [megaApiKey, setMegaApiKey] = useState('')
  const [megaWebhookUrl, setMegaWebhookUrl] = useState('')
  const [openaiApiKey, setOpenaiApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const creds = megaApi.getCredentials()
    if (creds.apiKey) setMegaApiKey(creds.apiKey)
    if (creds.webhookUrl) setMegaWebhookUrl(creds.webhookUrl)
    if (creds.openaiApiKey) setOpenaiApiKey(creds.openaiApiKey)
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (!megaApiKey || !megaWebhookUrl || !openaiApiKey) {
        toast({
          variant: 'destructive',
          title: 'Campos obrigatórios',
          description: 'Preencha todas as credenciais para continuar.',
        })
        setIsLoading(false)
        return
      }

      // Test connections before saving
      await megaApi.testConnection(megaApiKey)

      // Simulate saving to Supabase Vault/Secrets
      await megaApi.updateConfiguration(
        megaApiKey,
        megaWebhookUrl,
        openaiApiKey,
      )

      toast({
        title: 'Configurações salvas',
        description: 'As credenciais foram atualizadas com segurança.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Falha na validação das credenciais. Verifique os dados.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie as integrações e chaves de API do sistema.
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
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
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
                Configure a conexão com o gateway de mensagens WhatsApp.
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
                <p className="text-[0.8rem] text-muted-foreground">
                  Chave de acesso para envio e recebimento de mensagens.
                </p>
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

          {/* OpenAI / ChatGPT Configuration */}
          <Card className="border-primary/20 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  <CardTitle>ChatGPT (OpenAI)</CardTitle>
                </div>
                <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded border border-green-200">
                  Supabase Edge Function
                </div>
              </div>
              <CardDescription>
                Integração inteligente para respostas automáticas via IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-slate-50 border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-slate-600" />
                <AlertTitle className="text-slate-700">
                  Armazenamento Seguro
                </AlertTitle>
                <AlertDescription className="text-slate-600">
                  Sua chave da API OpenAI será armazenada de forma segura no
                  Supabase e utilizada apenas através das Edge Functions.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="openai-key">OpenAI API Key</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="openai-key"
                    type="password"
                    placeholder="sk-..."
                    className="pl-9"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                  />
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Necessário para processamento de linguagem natural nas
                  conversas.
                </p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 border-t px-6 py-4">
              <p className="text-xs text-muted-foreground">
                O modelo utilizado será o <strong>gpt-4o-mini</strong> para
                otimizar custos e latência.
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
