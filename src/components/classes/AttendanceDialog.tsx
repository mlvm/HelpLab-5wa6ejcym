import { useState, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Student } from '@/types/class-types'
import { cn } from '@/lib/utils'

interface AttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className: string
  students: Student[]
  onSave: (students: Student[]) => void
}

export function AttendanceDialog({
  open,
  onOpenChange,
  className,
  students,
  onSave,
}: AttendanceDialogProps) {
  const [localStudents, setLocalStudents] = useState<Student[]>(students)

  useEffect(() => {
    setLocalStudents(students)
  }, [students, open])

  const updatePresence = (
    id: number,
    value: 'Presente' | 'Ausente' | 'Pendente',
  ) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, attendance: value } : s)),
    )
  }

  const handleSave = () => {
    const presentCount = localStudents.filter(
      (s) => s.attendance === 'Presente',
    ).length
    onSave(localStudents)
    toast.success(`Presença registrada: ${presentCount} participantes.`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Registrar Presença</DialogTitle>
          <DialogDescription>
            Marque a presença dos participantes da turma: {className}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status Inscrição</TableHead>
                <TableHead className="w-[180px]">Presença</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localStudents.map((student) => (
                <TableRow key={student.id}>
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
                  <TableCell>
                    <Select
                      value={student.attendance}
                      onValueChange={(val) =>
                        updatePresence(
                          student.id,
                          val as 'Presente' | 'Ausente' | 'Pendente',
                        )
                      }
                    >
                      <SelectTrigger
                        className={cn(
                          'h-8',
                          student.attendance === 'Presente' &&
                            'border-green-500 text-green-700 bg-green-50',
                          student.attendance === 'Ausente' &&
                            'border-red-500 text-red-700 bg-red-50',
                        )}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendente">Pendente</SelectItem>
                        <SelectItem value="Presente">Presente</SelectItem>
                        <SelectItem value="Ausente">Ausente</SelectItem>
                      </SelectContent>
                    </Select>
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
