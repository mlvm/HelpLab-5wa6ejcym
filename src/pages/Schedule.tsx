import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  ClassFormDialog,
  ClassFormValues,
} from '@/components/classes/ClassFormDialog'
import { toast } from 'sonner'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { DateRange } from 'react-day-picker'
import { isWithinInterval, startOfDay, endOfDay, parseISO } from 'date-fns'
import { cn } from '@/lib/utils'

const initialClasses = [
  {
    id: 101,
    title: 'Biossegurança - Turma A',
    date: '2024-10-15',
    time: '08:00 - 12:00',
    status: 'Lotada',
    instructor: 'Dr. Silva',
  },
  {
    id: 102,
    title: 'Primeiros Socorros',
    date: '2024-10-16',
    time: '14:00 - 18:00',
    status: 'Aberta',
    instructor: 'Enf. Maria',
  },
  {
    id: 103,
    title: 'Biossegurança - Turma B',
    date: '2024-10-18',
    time: '08:00 - 12:00',
    status: 'Planejada',
    instructor: 'Dr. Silva',
  },
  {
    id: 104,
    title: 'Gestão Laboratorial',
    date: '2024-10-22',
    time: '09:00 - 17:00',
    status: 'Aberta',
    instructor: 'Adm. Roberto',
  },
  {
    id: 105,
    title: 'Coleta de Amostras',
    date: '2024-10-25',
    time: '08:00 - 12:00',
    status: 'Cancelada',
    instructor: 'Bio. Carla',
  },
]

export default function Schedule() {
  const [classes, setClasses] = useState(initialClasses)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([])

  const handleCreateClass = (data: ClassFormValues) => {
    const newClass = {
      id: Math.floor(Math.random() * 1000) + 200,
      title: `Nova Turma (${data.trainingId})`,
      date: data.date.toISOString().split('T')[0],
      time: `${data.startTime} - ${data.endTime}`,
      status: data.status,
      instructor: `Instrutor ${data.instructorId}`,
    }
    setClasses([...classes, newClass])
    toast.success('Nova turma criada com sucesso!')
  }

  const toggleInstructor = (instructor: string) => {
    setSelectedInstructors((prev) =>
      prev.includes(instructor)
        ? prev.filter((i) => i !== instructor)
        : [...prev, instructor],
    )
  }

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) => (prev === status ? null : status))
  }

  const filteredClasses = classes.filter((cls) => {
    // Status Filter
    if (statusFilter && cls.status !== statusFilter) {
      return false
    }

    // Instructor Filter
    if (
      selectedInstructors.length > 0 &&
      !selectedInstructors.some((inst) => cls.instructor.includes(inst))
    ) {
      return false
    }

    // Date Range Filter
    if (dateRange?.from) {
      const clsDate = parseISO(cls.date)
      const start = startOfDay(dateRange.from)
      const end = endOfDay(dateRange.to || dateRange.from)

      if (!isWithinInterval(clsDate, { start, end })) {
        return false
      }
    }

    return true
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda e Turmas</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie as turmas agendadas.
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Criar Nova Turma
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-8 lg:col-span-9">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Outubro 2024</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* List View */}
            <div className="space-y-4 mt-4">
              {filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <Link
                    to={`/class/${cls.id}`}
                    key={cls.id}
                    className="block group"
                  >
                    <div className="flex items-center justify-between p-4 border rounded-lg hover:border-primary hover:bg-accent/10 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center bg-muted p-2 rounded w-16 text-center">
                          <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Out
                          </span>
                          <span className="text-xl font-bold">
                            {cls.date.split('-')[2]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {cls.title}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" /> {cls.time}
                            </span>
                            <span>• Instrutor: {cls.instructor}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Badge
                          variant={
                            cls.status === 'Lotada'
                              ? 'destructive'
                              : cls.status === 'Aberta'
                                ? 'default'
                                : cls.status === 'Planejada'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {cls.status}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma turma encontrada com os filtros selecionados.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4 lg:col-span-3 h-fit">
          <CardHeader>
            <CardTitle className="text-base">Filtros</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <DateRangePicker
                date={dateRange}
                setDate={setDateRange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex flex-wrap gap-2">
                {['Aberta', 'Lotada', 'Planejada'].map((status) => (
                  <Badge
                    key={status}
                    variant={statusFilter === status ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => toggleStatusFilter(status)}
                  >
                    {status === 'Aberta'
                      ? 'Abertas'
                      : status === 'Lotada'
                        ? 'Lotadas'
                        : 'Planejadas'}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Instrutor</label>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="inst1"
                    checked={selectedInstructors.includes('Dr. Silva')}
                    onCheckedChange={() => toggleInstructor('Dr. Silva')}
                  />
                  <label htmlFor="inst1" className="text-sm cursor-pointer">
                    Dr. Silva
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="inst2"
                    checked={selectedInstructors.includes('Enf. Maria')}
                    onCheckedChange={() => toggleInstructor('Enf. Maria')}
                  />
                  <label htmlFor="inst2" className="text-sm cursor-pointer">
                    Enf. Maria
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ClassFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateClass}
      />
    </div>
  )
}
