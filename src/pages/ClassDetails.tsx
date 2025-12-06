import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  Calendar,
  MapPin,
  Printer,
  MessageSquare,
  CheckSquare,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

export default function ClassDetails() {
  const { id } = useParams()

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Link to="/schedule" className="hover:underline">
          Agenda
        </Link>
        <span>/</span>
        <span>Turma #{id}</span>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Biossegurança Básica - Turma A
          </h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" /> 15 Out, 2024 • 08:00 - 12:00
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" /> Sala de Treinamento 1 - LACEN
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Lista de Presença
          </Button>
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" /> Comunicar
          </Button>
          <Button>
            <CheckSquare className="mr-2 h-4 w-4" /> Registrar Presença
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Inscritos</CardTitle>
            <CardDescription>
              Lista de profissionais matriculados nesta turma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profissional</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Status Inscrição</TableHead>
                  <TableHead>Presença</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Ana Clara Souza</TableCell>
                  <TableCell>123.***.***-00</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Confirmado
                    </Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Carlos Eduardo</TableCell>
                  <TableCell>987.***.***-11</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      Confirmado
                    </Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">João Paulo</TableCell>
                  <TableCell>456.***.***-22</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      Pendente
                    </Badge>
                  </TableCell>
                  <TableCell>-</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ocupação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                28
                <span className="text-xl text-muted-foreground font-normal">
                  /30
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Vagas Preenchidas</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progresso</span>
                <span>93%</span>
              </div>
              <Progress value={93} className="h-2" />
            </div>
            <div className="pt-4 border-t space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Instrutor</span>
                <span className="font-medium">Dr. Silva</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge>Lotada</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
