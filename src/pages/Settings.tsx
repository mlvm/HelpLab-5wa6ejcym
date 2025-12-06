import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'

export default function Settings() {
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

      <Tabs defaultValue="rules" className="space-y-4">
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
              <CardTitle>API do WhatsApp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value="************************"
                  readOnly
                />
              </div>
              <Button>Testar Conexão</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
