import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Badge } from '@/components/ui/badge'
import { Send, History, Mail, MessageCircle, Search } from 'lucide-react'
import {
  notificationService,
  NotificationLog,
} from '@/services/notification-service'
import { toast } from 'sonner'
import { format } from 'date-fns'

export default function Communications() {
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [channelFilter, setChannelFilter] = useState('all')

  // New Message State
  const [recipientContact, setRecipientContact] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [messageContent, setMessageContent] = useState('')
  const [sendChannel, setSendChannel] = useState<'whatsapp' | 'email'>(
    'whatsapp',
  )

  const refreshLogs = () => {
    setLogs(notificationService.getLogs())
  }

  useEffect(() => {
    refreshLogs()
  }, [])

  const handleSendMessage = async () => {
    if (!recipientContact || !messageContent) {
      toast.error('Preencha o contato e a mensagem.')
      return
    }

    const success = await notificationService.sendAdhocMessage(
      recipientName || 'Desconhecido',
      recipientContact,
      sendChannel,
      messageContent,
      sendChannel === 'email' ? 'Nova mensagem do HelpLab' : undefined,
    )

    if (success) {
      toast.success('Mensagem enviada com sucesso!')
      setMessageContent('')
      refreshLogs()
    } else {
      toast.error('Falha ao enviar mensagem.')
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.recipientContact.includes(searchQuery) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesChannel =
      channelFilter === 'all' || log.channel === channelFilter

    return matchesSearch && matchesChannel
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Central de Comunicações
        </h1>
        <p className="text-muted-foreground">
          Envie mensagens e acompanhe o histórico de notificações.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Send Message Form */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Nova Mensagem Rápida</CardTitle>
            <CardDescription>
              Envio avulso para um profissional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Canal de Envio</Label>
              <div className="flex gap-2">
                <Button
                  variant={sendChannel === 'whatsapp' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setSendChannel('whatsapp')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </Button>
                <Button
                  variant={sendChannel === 'email' ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => setSendChannel('email')}
                >
                  <Mail className="mr-2 h-4 w-4" /> Email
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nome do Destinatário</Label>
              <Input
                placeholder="Ex: João Silva"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{sendChannel === 'whatsapp' ? 'Telefone' : 'Email'}</Label>
              <Input
                placeholder={
                  sendChannel === 'whatsapp' ? '+55...' : 'email@exemplo.com'
                }
                value={recipientContact}
                onChange={(e) => setRecipientContact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                placeholder="Digite sua mensagem aqui..."
                className="h-32"
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSendMessage}>
              <Send className="mr-2 h-4 w-4" /> Enviar Mensagem
            </Button>
          </CardContent>
        </Card>

        {/* History Log */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" /> Histórico de Notificações
              </CardTitle>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative w-full md:w-48">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    className="pl-8 h-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={channelFilter} onValueChange={setChannelFilter}>
                  <SelectTrigger className="w-[120px] h-9">
                    <SelectValue placeholder="Canal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Destinatário</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                        {format(new Date(log.sentAt), 'dd/MM/yy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">
                            {log.recipientName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {log.recipientContact}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.channel === 'whatsapp'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-blue-50 text-blue-700'
                          }
                        >
                          {log.channel === 'whatsapp' ? (
                            <MessageCircle className="h-3 w-3 mr-1" />
                          ) : (
                            <Mail className="h-3 w-3 mr-1" />
                          )}
                          {log.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="truncate text-sm" title={log.content}>
                          {log.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.status === 'sent' ? 'default' : 'destructive'
                          }
                          className="text-[10px] h-5"
                        >
                          {log.status === 'sent' ? 'Enviado' : 'Falha'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
