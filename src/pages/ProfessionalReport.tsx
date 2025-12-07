import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, FileText, ChevronDown, ChevronUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { db, Appointment, Professional } from '@/services/database'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function ProfessionalReport() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [selectedProfessionalId, setSelectedProfessionalId] =
    useState<string>('')
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  useEffect(() => {
    setProfessionals(db.getProfessionals())
  }, [])

  useEffect(() => {
    if (selectedProfessionalId) {
      const allAppointments = db.getAppointments()
      const filtered = allAppointments.filter(
        (a) => a.professionalId === selectedProfessionalId,
      )
      setAppointments(filtered)
    } else {
      setAppointments([])
    }
  }, [selectedProfessionalId])

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const selectedProfessional = professionals.find(
    (p) => p.id === selectedProfessionalId,
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/reports">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Histórico de Agendamentos
          </h1>
          <p className="text-muted-foreground">
            Acompanhe o histórico completo de agendamentos e status por
            profissional.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Profissional</CardTitle>
          <CardDescription>
            Selecione um profissional para visualizar seu histórico.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedProfessionalId}
            onValueChange={setSelectedProfessionalId}
          >
            <SelectTrigger className="w-full md:w-[400px]">
              <SelectValue placeholder="Selecione o profissional" />
            </SelectTrigger>
            <SelectContent>
              {professionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} - {p.role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedProfessionalId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Relatório: {selectedProfessional?.name}
            </CardTitle>
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
              <span>CPF: {selectedProfessional?.cpf}</span>
              <span>Unidade: {selectedProfessional?.unit}</span>
            </div>
          </CardHeader>
          <CardContent>
            {appointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Treinamento</TableHead>
                    <TableHead>Data Agendada</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Status Atual</TableHead>
                    <TableHead>Criado Em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt) => (
                    <>
                      <TableRow
                        key={appt.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleRow(appt.id)}
                      >
                        <TableCell>
                          {expandedRows[appt.id] ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {appt.training}
                        </TableCell>
                        <TableCell>{appt.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{appt.channel}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge>{appt.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(appt.createdAt), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                      </TableRow>
                      {expandedRows[appt.id] && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={6}>
                            <div className="p-4 pl-12 space-y-2">
                              <h4 className="text-sm font-semibold mb-2">
                                Histórico de Alterações de Status
                              </h4>
                              {appt.history && appt.history.length > 0 ? (
                                <div className="space-y-4">
                                  {appt.history.map((hist, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-4 text-sm border-l-2 border-primary pl-4 relative"
                                    >
                                      <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                                      <div className="flex flex-col">
                                        <span className="font-medium">
                                          {hist.status}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {format(
                                            new Date(hist.timestamp),
                                            "dd/MM/yyyy 'às' HH:mm",
                                            { locale: ptBR },
                                          )}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          Atualizado por: {hist.updatedBy}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  Sem histórico registrado.
                                </p>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Este profissional não possui agendamentos registrados.
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
