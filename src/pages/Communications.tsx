import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Send, History } from 'lucide-react'

export default function Communications() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Módulo de Comunicações
        </h1>
        <p className="text-muted-foreground">
          Envie mensagens em massa para profissionais.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Mensagem</CardTitle>
            <CardDescription>
              Configure e envie uma notificação.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Destinatário</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="turma-a">
                    Turma: Biossegurança A
                  </SelectItem>
                  <SelectItem value="unidade-x">Unidade: LACEN</SelectItem>
                  <SelectItem value="todos">Todos Profissionais</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Canal</Label>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
                >
                  WhatsApp
                </Button>
                <Button variant="outline" className="flex-1">
                  Email
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite sua mensagem aqui..."
                className="h-32"
              />
            </div>
            <Button className="w-full">
              <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Histórico Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Lembrete de Turma</span>
                  <span className="text-xs text-muted-foreground">
                    Hoje, 09:00
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviado para: Turma Biossegurança A (28 pessoas)
                </p>
                <span className="text-xs text-green-600 font-medium">
                  Sucesso (28/28)
                </span>
              </div>
              <div className="border-b pb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Aviso de Cancelamento</span>
                  <span className="text-xs text-muted-foreground">
                    Ontem, 14:30
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enviado para: Turma Coleta (15 pessoas)
                </p>
                <span className="text-xs text-green-600 font-medium">
                  Sucesso (15/15)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
