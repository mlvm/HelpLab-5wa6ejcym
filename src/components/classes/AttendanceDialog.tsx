import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Student {
  id: number
  name: string
  cpf: string
  status: 'Confirmado' | 'Pendente'
  present: boolean
}

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className: string
}

// Mock Data for Students
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

export function AttendanceDialog({
  open,
  onOpenChange,
  className,
}: AttendanceDialogProps) {
  const [students, setStudents] = useState<Student[]>(initialStudents)

  const togglePresence = (id: number, checked: boolean) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: checked } : s)),
    )
  }

  const handleSave = () => {
    const count = students.filter((s) => s.present).length
    toast.success(`Presença registrada para ${count} participantes.`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Registrar Presença</DialogTitle>
          <DialogDescription>
            Marque os participantes presentes na turma: {className}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Presença</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <Checkbox
                      checked={student.present}
                      onCheckedChange={(checked) =>
                        togglePresence(student.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div>{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.cpf}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        student.status === 'Confirmado'
                          ? 'outline'
                          : 'secondary'
                      }
                      className={
                        student.status === 'Confirmado'
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : ''
                      }
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar Presença</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
