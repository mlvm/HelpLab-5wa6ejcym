import {
  Bot,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  WhatsappConversation,
  WhatsappMessage,
  Profissional,
} from '@/pages/WhatsappPanel.data'

interface WhatsappChatWindowProps {
  conversation: WhatsappConversation | undefined
  messages: WhatsappMessage[]
  professional: Profissional | undefined
}

export function WhatsappChatWindow({
  conversation,
  messages,
  professional,
}: WhatsappChatWindowProps) {
  if (!conversation) {
    return (
      <div className="md:col-span-6 flex flex-col items-center justify-center h-full bg-muted/10 rounded-lg border text-muted-foreground">
        <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
        <p>Selecione uma conversa para visualizar o histórico</p>
      </div>
    )
  }

  const lastUserIntent =
    messages
      .filter((m) => m.remetente === 'USUARIO')
      .pop()
      ?.intencaoDetectada?.replace('Intenção:', '') || 'Desconhecida'

  return (
    <div className="md:col-span-6 flex flex-col h-full bg-muted/10 rounded-lg border overflow-hidden">
      {/* Chat Header */}
      <div className="bg-background border-b p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={
                professional?.avatarSeed
                  ? `https://img.usecurling.com/ppl/thumbnail?gender=female&seed=${professional.avatarSeed}`
                  : undefined
              }
            />
            <AvatarFallback>
              {conversation.profissionalNome?.substring(0, 2).toUpperCase() ||
                '??'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-sm">
              {conversation.profissionalNome || conversation.telefone}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Bot className="h-3 w-3 text-primary" /> Última intenção:{' '}
              {lastUserIntent}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={() => console.log('Ver profissional')}
        >
          Ver profissional <MoreVertical className="ml-1 h-3 w-3" />
        </Button>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 bg-muted/5">
        <div className="space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-[80%]',
                msg.remetente === 'USUARIO'
                  ? 'self-start items-start'
                  : 'self-end items-end ml-auto',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground">
                  {msg.remetente === 'USUARIO' ? 'Usuário' : 'Bot HelpLab'}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {msg.criadoEm}
                </span>
              </div>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2 text-sm shadow-sm',
                  msg.remetente === 'USUARIO'
                    ? 'bg-white border text-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none',
                )}
              >
                {msg.conteudo}
              </div>

              {/* Metadata Tags */}
              {msg.intencaoDetectada && (
                <Badge
                  variant="secondary"
                  className="mt-1 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                >
                  <Bot className="h-3 w-3 mr-1" /> {msg.intencaoDetectada}
                </Badge>
              )}
              {msg.acaoExecutadaPeloBot && (
                <Badge
                  variant="secondary"
                  className="mt-1 text-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />{' '}
                  {msg.acaoExecutadaPeloBot}
                </Badge>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Readonly Footer */}
      <div className="p-3 border-t bg-background text-center text-xs text-muted-foreground">
        <AlertCircle className="h-3 w-3 inline-block mr-1" />
        Este painel é apenas para visualização. Não é possível enviar mensagens
        por aqui.
      </div>
    </div>
  )
}
