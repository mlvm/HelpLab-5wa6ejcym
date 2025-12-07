import { User, Calendar, ExternalLink, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  WhatsappConversation,
  Profissional,
  AgendamentoResumo,
} from '@/pages/WhatsappPanel.data'

interface WhatsappContextPanelProps {
  conversation: WhatsappConversation | undefined
  professional: Profissional | undefined
  appointments: AgendamentoResumo[]
  messageCount: number
  notes: string
  setNotes: (notes: string) => void
}

export function WhatsappContextPanel({
  conversation,
  professional,
  appointments,
  messageCount,
  notes,
  setNotes,
}: WhatsappContextPanelProps) {
  return (
    <div className="md:col-span-3 flex flex-col gap-4 h-full border-l pl-4">
      <ScrollArea className="h-full -mr-3 pr-3">
        <div className="space-y-6">
          {/* Profissional Data */}
          {conversation ? (
            <>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <User className="h-4 w-4" /> Dados do Profissional
                </h3>
                {professional ? (
                  <Card>
                    <CardContent className="p-4 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Nome</p>
                        <p className="font-medium text-sm">
                          {professional.nome}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">CPF</p>
                          <p className="font-medium text-sm">
                            {professional.cpf}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Status
                          </p>
                          <Badge
                            variant={
                              professional.status === 'ATIVO'
                                ? 'default'
                                : 'secondary'
                            }
                            className="mt-0.5 text-[10px]"
                          >
                            {professional.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Unidade</p>
                        <p className="font-medium text-sm">
                          {professional.unidade}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full h-8 text-xs mt-2"
                        onClick={() =>
                          console.log('Abrir ficha', professional.id)
                        }
                      >
                        Abrir ficha completa{' '}
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-muted/30 border-dashed">
                    <CardContent className="p-4 text-center py-8">
                      <p className="text-xs text-muted-foreground">
                        Profissional não identificado na base de dados.
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-xs mt-2"
                      >
                        Vincular manualmente
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              <Separator />

              {/* Appointments */}
              <div className="space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Agendamentos
                </h3>
                {appointments.length > 0 ? (
                  <div className="space-y-2">
                    {appointments.map((apt) => (
                      <Card key={apt.id} className="bg-muted/10">
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-xs text-primary">
                              {apt.treinamentoNome}
                            </span>
                            <Badge variant="outline" className="text-[10px]">
                              {apt.status}
                            </Badge>
                          </div>
                          <p className="text-xs font-medium">
                            {apt.turmaDescricao}
                          </p>
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] text-muted-foreground bg-muted px-1 rounded">
                              Via {apt.origem}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Nenhum agendamento vinculado a esta conversa.
                  </p>
                )}
              </div>

              <Separator />

              {/* Internal Notes */}
              <div className="space-y-2">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Notas Internas
                </h3>
                <Textarea
                  placeholder="Adicione observações sobre este atendimento..."
                  className="text-xs resize-none min-h-[100px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {/* Metadata */}
              <div className="pt-4 text-[10px] text-muted-foreground space-y-1">
                <p>ID Conversa: {conversation.id}</p>
                <p>Origem: WhatsApp API</p>
                <p>Mensagens: {messageCount}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">
              <p>
                Detalhes do contexto aparecerão aqui ao selecionar uma conversa.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
