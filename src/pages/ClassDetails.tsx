import { useState } from 'react'
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
  Calendar,
  MapPin,
  Printer,
  MessageSquare,
  CheckSquare,
  CheckCircle2,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AttendanceDialog } from '@/components/classes/AttendanceDialog'
import { Student } from '@/types/class-types'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const initialStudents: Student[] = [
  {
    id: 1,
    name: 'Ana Clara Souza',
    cpf: '123.***.***-00',
    status: 'Confirmado',
    present: false,
  },
  {
    id: 2,
    name: 'Carlos Eduardo',
    cpf: '987.***.***-11',
    status: 'Confirmado',
    present: false,
  },
  {
    id: 3,
    name: 'João Paulo',
    cpf: '456.***.***-22',
    status: 'Pendente',
    present: false,
  },
]

export default function ClassDetails() {
  const { id } = useParams()
  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [classStatus, setClassStatus] = useState<string>('Lotada')

  const handleAttendanceSave = (updatedStudents: Student[]) => {
    setStudents(updatedStudents)
  }

  const allConfirmedPresent = students
    .filter((s) => s.status === 'Confirmado')
    .every((s) => s.present)

  const handleCompleteClass = () => {
    setClassStatus('Concluída')
    toast.success('Turma marcada como Concluída com sucesso!')
  }

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
        <div className="flex flex-wrap gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" /> Lista de Presença
          </Button>
          <Button variant="outline">
            <MessageSquare className="mr-2 h-4 w-4" /> Comunicar
          </Button>
          <Button
            onClick={() => setIsAttendanceOpen(true)}
            disabled={classStatus === 'Concluída'}
          >
            <CheckSquare className="mr-2 h-4 w-4" /> Registrar Presença
          </Button>
          <Button
            onClick={handleCompleteClass}
            disabled={!allConfirmedPresent || classStatus === 'Concluída'}
            variant={classStatus === 'Concluída' ? 'secondary' : 'default'}
            className={cn(
              classStatus === 'Concluída' &&
                'bg-green-100 text-green-800 hover:bg-green-200',
            )}
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {classStatus === 'Concluída' ? 'Concluída' : 'Concluir Turma'}
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
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.cpf}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          student.status === 'Confirmado'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }
                      >
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {student.present ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Presente
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
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
                <Badge
                  variant={
                    classStatus === 'Concluída'
                      ? 'secondary'
                      : classStatus === 'Lotada'
                        ? 'destructive'
                        : 'default'
                  }
                  className={cn(
                    classStatus === 'Concluída' &&
                      'bg-green-100 text-green-800 hover:bg-green-200 border-transparent',
                  )}
                >
                  {classStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AttendanceDialog
        open={isAttendanceOpen}
        onOpenChange={setIsAttendanceOpen}
        className="Biossegurança Básica - Turma A"
        students={students}
        onSave={handleAttendanceSave}
      />
    </div>
  )
}
