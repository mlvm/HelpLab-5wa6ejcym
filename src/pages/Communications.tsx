import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { megaApi } from '@/services/mega-api'

export default function Communications() {
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!phone || !message) {
      toast.error('Preencha todos os campos')
      return
    }

    setLoading(true)
    try {
      // Use Find or Create conversation flow implicitly handled by sendMessage with phone?
      // megaApi.sendMessage requires conversationId usually, but we added support for direct phone
      // Need to ensure conversation exists first
      const convId = await megaApi.findOrCreateConversation(
        phone,
        'Novo Contato',
      )
      await megaApi.sendMessage(convId, message, 'BOT')

      toast.success('Mensagem enviada com sucesso')
      setMessage('')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao enviar mensagem')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight">Comunicações</h1>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" /> Envio Rápido WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              placeholder="5511999999999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder="Digite a mensagem..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
          <Button onClick={handleSend} disabled={loading} className="w-full">
            <Send className="mr-2 h-4 w-4" /> Enviar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
