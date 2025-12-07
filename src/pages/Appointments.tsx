import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
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
    status: 'Cancelado',
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

  // Filter logic would go here, using the selected dates
  // For now, we just display the controls as per requirements

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Central de Agendamentos
        </h1>
        <p className="text-muted-foreground">
          Controle todas as inscrições e status de agendamento.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por profissional ou treinamento..."
                className="pl-8"
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
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                  <SelectItem value="noshow">Faltou</SelectItem>
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
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((apt) => (
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
                      variant={
                        apt.status === 'Confirmado'
                          ? 'default'
                          : apt.status === 'Cancelado'
                            ? 'secondary'
                            : apt.status === 'Faltou'
                              ? 'destructive'
                              : 'outline'
                      }
                    >
                      {apt.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
