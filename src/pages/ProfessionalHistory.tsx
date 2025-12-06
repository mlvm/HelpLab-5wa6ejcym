import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Award, Clock } from 'lucide-react'

export default function ProfessionalHistory() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Meu Histórico</h1>
        <p className="text-muted-foreground">
          Acompanhe seus treinamentos e certificados.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Próximos Agendamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h4 className="font-medium">Biossegurança Avançada</h4>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-3 w-3 mr-1" /> 20/10/2024 • 08:00
                  </div>
                </div>
                <Badge>Confirmado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" /> Meus Certificados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h4 className="font-medium">Primeiros Socorros</h4>
                  <p className="text-sm text-muted-foreground">
                    Concluído em Set/2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Baixar PDF
                </Button>
              </div>
              <div className="flex items-center justify-between border p-4 rounded-lg">
                <div>
                  <h4 className="font-medium">Ética Profissional</h4>
                  <p className="text-sm text-muted-foreground">
                    Concluído em Ago/2024
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Baixar PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
