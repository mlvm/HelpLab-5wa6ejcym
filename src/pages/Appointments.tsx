import { useState } from 'react'
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

// Updated mock data structure removing classStatus and using unified statuses
const initialAppointments = [
  {
    id: 1,
    prof: 'Ana Clara',
    training: 'Biossegurança',
    date: '15/10/2024',
    channel: 'WhatsApp',
    status: 'Confirmado',
  },
  {
    id: 2,
    prof: 'Carlos Eduardo',
    training: 'Biossegurança',
    date: '15/10/2024',
    channel: 'WhatsApp',
    status: 'Confirmado',
  },
  {
    id: 3,
    prof: 'Roberto Alves',
    training: 'Primeiros Socorros',
    date: '16/10/2024',
    channel: 'WhatsApp',
    status: 'Cancelada',
  },
  {
    id: 4,
    prof: 'Fernanda Lima',
    training: 'Biossegurança',
    date: '15/10/2024',
    channel: 'WhatsApp',
    status: 'Faltou',
  },
]

export default function Appointments() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [specificDate, setSpecificDate] = useState<Date | undefined>(undefined)
  const { statuses, getStatusColor } = useClassStatus()
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const handleCreateClick = () => {
    setDialogMode('add')
    setSelectedAppointment(null)
    setDialogOpen(true)
  }

  const handleEditClick = (appointment: any) => {
    setDialogMode('edit')
    setSelectedAppointment(appointment)
    setDialogOpen(true)
  }

  const handleDeleteClick = (id: number) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id))
    toast.success('Agendamento removido com sucesso.')
  }

  const handleStatusChange = (id: number, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt)),
    )
    toast.success(`Status alterado para ${newStatus}`)
  }

  const handleFormSubmit = (data: AppointmentFormValues) => {
    const formattedDate = format(data.date, 'dd/MM/yyyy')

    if (dialogMode === 'add') {
      const newAppointment = {
        id: Math.max(...appointments.map((a) => a.id), 0) + 1,
        prof: data.prof,
        training: data.training,
        date: formattedDate,
        channel: data.channel,
        status: data.status,
      }
      setAppointments((prev) => [newAppointment, ...prev])
      toast.success('Novo agendamento criado com sucesso.')
    } else if (dialogMode === 'edit' && selectedAppointment) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === selectedAppointment.id
            ? {
                ...apt,
                prof: data.prof,
                training: data.training,
                date: formattedDate,
                channel: data.channel,
                status: data.status,
              }
            : apt,
        ),
      )
      toast.success('Agendamento atualizado com sucesso.')
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
    // Note: Date logic would go here in a real implementation with parsed dates
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
                        <DropdownMenuItem
                          onClick={() => handleEditClick(apt)} // View same as Edit for now
                        >
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
