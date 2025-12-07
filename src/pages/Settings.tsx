import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import {
  Eye,
  EyeOff,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { megaApi } from '@/services/mega-api'

export default function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const { toast } = useToast()

  // Load existing credentials on mount
  useEffect(() => {
    const credentials = megaApi.getCredentials()
    if (credentials.apiKey) setApiKey(credentials.apiKey)
    if (credentials.webhookUrl) setWebhookUrl(credentials.webhookUrl)
  }, [])

  const handleSaveMegaApi = async () => {
    if (!apiKey || !webhookUrl) {
      toast({
        variant: 'destructive',
        title: 'Erro de Validação',
        description: 'Por favor, preencha todos os campos obrigatórios.',
      })
      return
    }

    setIsSaving(true)
    try {
      await megaApi.updateConfiguration(apiKey, webhookUrl)
      toast({
        title: 'Configuração Salva',
        description: 'Credenciais da Mega API atualizadas com sucesso.',
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao Salvar',
        description: 'Não foi possível persistir as credenciais.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleTestConnection = async () => {
    if (!apiKey) {
      toast({
        variant: 'destructive',
        title: 'Chave de API necessária',
        description: 'Insira uma chave de API para testar.',
      })
      return
    }

    setIsTesting(true)
    try {
      await megaApi.testConnection(apiKey)
      toast({
        title: 'Conexão Bem-sucedida',
        description: 'A Mega API respondeu corretamente.',
        action: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Falha na Conexão',
        description:
          'Não foi possível conectar com a Mega API. Verifique a chave.',
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-muted-foreground">
          Gerencie regras, modelos e integrações.
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Regras de Negócio</TabsTrigger>
          <TabsTrigger value="templates">Modelos de Mensagem</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle>Regras de Cancelamento e Certificação</CardTitle>
              <CardDescription>
                Defina os parâmetros globais do sistema.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>Prazo Mínimo para Cancelamento (horas)</Label>
                <Input
                  type="number"
                  defaultValue="24"
                  className="max-w-[200px]"
                />
              </div>
              <div className="grid gap-2">
                <Label>Frequência Mínima para Certificado (%)</Label>
                <Input
                  type="number"
                  defaultValue="75"
                  className="max-w-[200px]"
                />
              </div>
              <div className="flex items-center space-x-2 pt-4">
                <Switch id="auto-cert" defaultChecked />
                <Label htmlFor="auto-cert">
                  Gerar certificados automaticamente após conclusão
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Modelos de WhatsApp</CardTitle>
              <CardDescription>
                Edite as mensagens enviadas automaticamente pelo bot.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border p-4 rounded-md">
                  <h4 className="font-medium mb-2">
                    Confirmação de Agendamento
                  </h4>
                  <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    Olá {'{{nome}}'}, sua inscrição no treinamento{' '}
                    {'{{treinamento}}'} foi confirmada para o dia {'{{data}}'}.
                  </p>
                  <Button variant="link" className="px-0">
                    Editar Modelo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp API (Mega API)</CardTitle>
              <CardDescription>
                Configure as credenciais para conexão com a Inteligência
                Artificial do WhatsApp.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="api-key">Mega API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="mega_live_..."
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowKey(!showKey)}
                  >
                    {showKey ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">Toggle password visibility</span>
                  </Button>
                </div>
                <p className="text-[0.8rem] text-muted-foreground">
                  Chave de produção para acesso aos endpoints da Mega API.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  type="url"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://sua-app.com/api/webhooks/mega"
                />
                <p className="text-[0.8rem] text-muted-foreground">
                  Endpoint para receber eventos de mensagens e status em tempo
                  real.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <p className="text-xs text-yellow-800">
                  Certifique-se de que a URL do Webhook está publicamente
                  acessível para receber notificações da Mega API.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6 bg-muted/20">
              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTesting || !apiKey}
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Testando...
                  </>
                ) : (
                  'Testar Conexão'
                )}
              </Button>
              <Button onClick={handleSaveMegaApi} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
