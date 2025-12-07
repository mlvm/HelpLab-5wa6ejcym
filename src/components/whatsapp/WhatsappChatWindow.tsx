import { useState, useRef, useEffect } from 'react'
import {
  Bot,
  MessageSquare,
  MoreVertical,
  CheckCircle2,
  Send,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  WhatsappConversation,
  WhatsappMessage,
  Profissional,
  ChatSender,
} from '@/pages/WhatsappPanel.data'

interface WhatsappChatWindowProps {
  conversation: WhatsappConversation | undefined
  messages: WhatsappMessage[]
  professional: Profissional | undefined
  onSendMessage: (text: string, sender: ChatSender) => void
  isProcessing?: boolean
}

export function WhatsappChatWindow({
  conversation,
  messages,
  professional,
  onSendMessage,
  isProcessing,
}: WhatsappChatWindowProps) {
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

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
      ?.intencaoDetectada?.replace('Intenção:', '') || 'Aguardando interação...'

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (inputText.trim()) {
      // Default to USUARIO to simulate AI testing as per user story requirements
      onSendMessage(inputText, 'USUARIO')
      setInputText('')
    }
  }

  return (
    <div className="md:col-span-6 flex flex-col h-full bg-muted/10 rounded-lg border overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="bg-background border-b p-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-background shadow-sm">
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
            <h3 className="font-medium text-sm flex items-center gap-2">
              {conversation.profissionalNome || conversation.telefone}
              <Badge variant="outline" className="text-[10px] font-normal h-5">
                {conversation.origem}
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Bot className="h-3 w-3 text-primary" /> Intenção:{' '}
              <span className="font-medium text-foreground/80">
                {lastUserIntent}
              </span>
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
      <ScrollArea className="flex-1 p-4 bg-slate-50/50" ref={scrollRef}>
        <div className="space-y-6 pb-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex flex-col max-w-[85%] animate-fade-in-up',
                msg.remetente === 'USUARIO'
                  ? 'self-start items-start'
                  : 'self-end items-end ml-auto',
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  {msg.remetente === 'USUARIO' ? (
                    <>
                      <User className="h-3 w-3" /> Usuário
                    </>
                  ) : (
                    <>
                      <Bot className="h-3 w-3" /> Bot HelpLab
                    </>
                  )}
                </span>
                <span className="text-[10px] text-muted-foreground/70">
                  {new Date(msg.criadoEm).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div
                className={cn(
                  'rounded-2xl px-4 py-2.5 text-sm shadow-sm relative',
                  msg.remetente === 'USUARIO'
                    ? 'bg-white border text-foreground rounded-tl-none'
                    : 'bg-primary text-primary-foreground rounded-tr-none',
                )}
              >
                {msg.conteudo}
              </div>

              {/* Metadata Tags - AI Reasoning */}
              {(msg.intencaoDetectada || msg.acaoExecutadaPeloBot) && (
                <div className="flex flex-wrap gap-1 mt-1.5 ml-1">
                  {msg.intencaoDetectada && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 px-2 py-0.5 cursor-help"
                        >
                          <Bot className="h-3 w-3 mr-1" />{' '}
                          {msg.intencaoDetectada}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Intenção identificada pela IA Mega API</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {msg.acaoExecutadaPeloBot && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200 px-2 py-0.5 cursor-help"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />{' '}
                          {msg.acaoExecutadaPeloBot}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ação executada no sistema</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Interaction Footer - Testing AI */}
      <div className="p-3 border-t bg-background">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <Input
            placeholder="Simular mensagem do usuário (teste da IA)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-muted/20 focus-visible:ring-primary/50"
            disabled={isProcessing}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!inputText.trim() || isProcessing}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="flex justify-between mt-2 px-1">
          <span className="text-[10px] text-muted-foreground">
            * Mensagens enviadas aqui simulam a interação do usuário final para
            validar o raciocínio da IA.
          </span>
        </div>
      </div>
    </div>
  )
}
