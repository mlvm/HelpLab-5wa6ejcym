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
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Student } from '@/types/class-types'

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

  const togglePresence = (id: number, checked: boolean) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: checked } : s)),
    )
  }

  const handleSave = () => {
    const count = localStudents.filter((s) => s.present).length
    onSave(localStudents)
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
              {localStudents.map((student) => (
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
