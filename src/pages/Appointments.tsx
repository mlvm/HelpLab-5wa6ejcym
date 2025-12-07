import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  Tag,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRange } from 'react-day-picker'
import { useClassStatus } from '@/contexts/ClassStatusContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import {
  AppointmentFormDialog,
  AppointmentFormValues,
} from '@/components/appointments/AppointmentFormDialog'
import { toast } from 'sonner'
import { db, Appointment } from '@/services/database'
import { megaApi } from '@/services/mega-api'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined)
  const { statuses, getStatusColor } = useClassStatus()
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  // Load appointments from mock DB
  const refreshData = () => {
    setAppointments(db.getAppointments())
  }

  useEffect(() => {
    refreshData()

    // Listen to changes in other tabs (simulated by interval or event)
    const interval = setInterval(refreshData, 2000)
    return () => clearInterval(interval)
  }, [])

  const handleCreateClick = () => {
    setDialogMode('add')
    setSelectedAppointment(null)
    setDialogOpen(true)
  }

  const handleEditClick = (appointment: Appointment) => {
    // We need to fetch the professional details to populate the form
    const professional = db
      .getProfessionals()
      .find((p) => p.id === appointment.professionalId)

    setDialogMode('edit')
    setSelectedAppointment({
      ...appointment,
      professional, // Pass the linked professional data
    })
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    db.deleteAppointment(id)
    refreshData()
    toast.success('Agendamento removido com sucesso.')
  }

  const handleStatusChange = async (id: number, newStatus: string) => {
    const appointment = appointments.find((a) => a.id === id)
    const oldStatus = appointment?.status

    db.updateAppointment(id, { status: newStatus })
    refreshData()
    toast.success(`Status alterado para ${newStatus}`)

    // Automatic Notification Logic
    if (appointment && oldStatus === 'Agendado') {
      if (newStatus === 'Confirmado' || newStatus === 'Cancelado') {
        const prof = db
          .getProfessionals()
          .find((p) => p.id === appointment.professionalId)
        if (prof && prof.whatsapp) {
          try {
            await megaApi.sendStatusUpdateNotification(
              prof.whatsapp,
              prof.name,
              appointment.training,
              appointment.date,
              newStatus,
            )
            toast.success('Notificação WhatsApp enviada!')
          } catch (error) {
            console.error('Failed to send notification', error)
            toast.error('Falha ao enviar notificação WhatsApp')
          }
        }
      }
    }
  }

  const handleFormSubmit = async (data: AppointmentFormValues) => {
    try {
      if (dialogMode === 'add') {
        // 1. Create or Update Professional
        const prof = db.upsertProfessional({
          name: data.prof,
          cpf: data.cpf,
          whatsapp: data.whatsapp,
          unit: data.unit,
          role: data.role,
        })

        // 2. Create Appointment
        const appt = db.createAppointment({
          professionalId: prof.id,
          profName: prof.name,
          training: data.training,
          date: data.date,
          channel: data.channel,
          status: data.status,
        })

        toast.success('Novo agendamento criado com sucesso.')

        // Send Notification
        if (prof.whatsapp) {
          try {
            await megaApi.sendAppointmentConfirmation(
              prof.whatsapp,
              prof.name,
              appt.training,
              appt.date,
            )
            toast.success('Confirmação enviada via WhatsApp!')
          } catch (error) {
            console.error('Failed to send notification', error)
          }
        }
      } else if (dialogMode === 'edit' && selectedAppointment) {
        // In edit mode, we typically update the appointment details
        // Ideally we might also update professional details if they changed
        if (data.cpf) {
          // Check if we have professional data to update
          db.upsertProfessional({
            name: data.prof,
            cpf: data.cpf,
            whatsapp: data.whatsapp,
            unit: data.unit,
            role: data.role,
          })
        }

        let formattedDate = ''
        if (data.date instanceof Date) {
          formattedDate = format(data.date, 'dd/MM/yyyy')
        }

        db.updateAppointment(selectedAppointment.id, {
          prof: data.prof,
          training: data.training,
          date: formattedDate,
          channel: data.channel,
          status: data.status,
        })

        toast.success('Agendamento atualizado com sucesso.')
      }
      refreshData()
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar os dados.')
    }
  }

  // Filter logic
  const filteredAppointments = appointments.filter((apt) => {
    // Search filter
    if (
      searchQuery &&
      !apt.prof.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !apt.training.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    // Date filter can be added here
    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Central de Agendamentos
          </h1>
          <p className="text-muted-foreground">
            Controle todas as inscrições e status de agendamento.
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por profissional ou treinamento..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <DatePicker
                date={specificDate}
                setDate={setSpecificDate}
                placeholder="Data Específica"
                className="w-[180px]"
              />
              <DateRangePicker
                date={dateRange}
                setDate={setDateRange}
                className="w-auto"
              />
              <Select defaultValue="whatsapp">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Canal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
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
                <TableHead>Profissional</TableHead>
                <TableHead>Treinamento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Status Agendamento</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((apt) => (
                <TableRow key={apt.id}>
                  <TableCell className="font-medium">{apt.prof}</TableCell>
                  <TableCell>{apt.training}</TableCell>
                  <TableCell>{apt.date}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 border-green-200"
                    >
                      {apt.channel}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="border-transparent text-white"
                      style={{
                        backgroundColor: getStatusColor(apt.status),
                      }}
                    >
                      {apt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(apt)}>
                          <Eye className="mr-2 h-4 w-4" /> Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditClick(apt)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger>
                            <Tag className="mr-2 h-4 w-4" /> Mudar Status
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup
                              value={apt.status}
                              onValueChange={(value) =>
                                handleStatusChange(apt.id, value)
                              }
                            >
                              {statuses.map((status) => (
                                <DropdownMenuRadioItem
                                  key={status.id}
                                  value={status.name}
                                >
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="h-2 w-2 rounded-full"
                                      style={{ backgroundColor: status.color }}
                                    />
                                    {status.name}
                                  </div>
                                </DropdownMenuRadioItem>
                              ))}
                            </DropdownMenuRadioGroup>
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(apt.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredAppointments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhum agendamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AppointmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialData={selectedAppointment}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
