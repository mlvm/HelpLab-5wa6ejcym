import { useState, useEffect } from 'react'
import { Save, Loader2, Server, Zap, CheckCircle2, XCircle } from 'lucide-react'
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
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { megaApi } from '@/services/mega-api'
import { userSettingsService } from '@/services/user-settings'
import { cn } from '@/lib/utils'

export default function Settings() {
  const [instanceKey, setInstanceKey] = useState('')
  const [token, setToken] = useState('')

  const [megaStatus, setMegaStatus] = useState<'connected' | 'error' | 'idle'>(
    'idle',
  )
  const [megaMessage, setMegaMessage] = useState('')
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        const creds = await megaApi.fetchCredentials()
        setInstanceKey(creds.instanceKey)
        setToken(creds.token)
      } catch (e) {
        console.error(e)
        toast({
          variant: 'destructive',
          title: 'Erro ao carregar configurações',
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [toast])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await userSettingsService.saveSettings({
        mega_api_instance_key: instanceKey,
        mega_api_token: token,
      })
      toast({ title: 'Credenciais salvas com sucesso.' })
    } catch (e) {
      console.error(e)
      toast({ variant: 'destructive', title: 'Erro ao salvar credenciais' })
    } finally {
      setIsSaving(false)
    }
  }

  const checkConnection = async () => {
    if (!instanceKey || !token) {
      toast({
        variant: 'destructive',
        title: 'Preencha as credenciais primeiro.',
      })
      return
    }

    setIsChecking(true)
    setMegaStatus('idle')
    try {
      // Save first to satisfy requirements
      await userSettingsService.saveSettings({
        mega_api_instance_key: instanceKey,
        mega_api_token: token,
      })

      const result = await megaApi.connect({ instanceKey, token })
      setMegaStatus(result.success ? 'connected' : 'error')
      setMegaMessage(result.message)

      if (result.success) {
        toast({ title: 'Conexão bem-sucedida!', variant: 'default' })
      } else {
        toast({
          title: 'Falha na conexão',
          description: result.message,
          variant: 'destructive',
        })
      }
    } catch (e) {
      setMegaStatus('error')
      setMegaMessage('Erro interno')
    } finally {
      setIsChecking(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie integrações e credenciais do sistema.
          </p>
        </div>
      </div>

      <Card className="border-l-4 border-l-blue-600">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-600" />
              <CardTitle>Mega API (WhatsApp)</CardTitle>
            </div>
            <Badge
              variant={megaStatus === 'connected' ? 'default' : 'destructive'}
              className={cn(
                'transition-colors',
                megaStatus === 'connected' ? 'bg-green-600' : 'bg-secondary',
              )}
            >
              {megaStatus === 'connected' ? 'Conectado' : 'Desconectado'}
            </Badge>
          </div>
          <CardDescription>
            Configure suas credenciais da Mega API para habilitar o envio de
            mensagens.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instance Key</Label>
              <Input
                placeholder="megastart-..."
                value={instanceKey}
                onChange={(e) => setInstanceKey(e.target.value)}
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label>Token</Label>
              <Input
                placeholder="Token de acesso"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                type="password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar Credenciais
            </Button>
            <Button
              onClick={checkConnection}
              disabled={isChecking || !instanceKey || !token}
            >
              {isChecking ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              Testar Conexão Real
            </Button>
          </div>

          {megaMessage && (
            <div
              className={cn(
                'mt-4 p-3 rounded text-sm flex items-center gap-2',
                megaStatus === 'connected'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700',
              )}
            >
              {megaStatus === 'connected' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              {megaMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
