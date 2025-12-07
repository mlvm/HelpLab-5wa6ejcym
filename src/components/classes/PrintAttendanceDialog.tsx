import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Student } from '@/types/class-types'
import { Printer } from 'lucide-react'

interface PrintAttendanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  className: string
  students: Student[]
  date?: string
  instructor?: string
}

export function PrintAttendanceDialog({
  open,
  onOpenChange,
  className,
  students,
  date,
  instructor,
}: PrintAttendanceDialogProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('printable-area')
    if (!printContent) return

    const win = window.open('', '', 'height=800,width=1000')
    if (!win) return

    win.document.write('<html><head><title>Lista de Presença</title>')
    win.document.write(`
      <style>
        body { font-family: sans-serif; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 12px; text-align: left; font-size: 14px; }
        th { background-color: #f2f2f2; }
        .header { margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
        .header h1 { margin: 0; font-size: 24px; }
        .info { margin-top: 10px; font-size: 14px; color: #333; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; }
        .signature-box { text-align: center; }
        .signature-line { border-top: 1px solid #000; width: 250px; margin-bottom: 5px; }
      </style>
    `)
    win.document.write('</head><body>')
    win.document.write(printContent.innerHTML)
    win.document.write('</body></html>')
    win.document.close()
    win.focus()
    setTimeout(() => {
      win.print()
    }, 500)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Imprimir Lista de Presença</DialogTitle>
        </DialogHeader>
        <div
          className="flex-1 overflow-auto bg-white p-8 border rounded-md shadow-sm"
          id="printable-area"
        >
          <div className="header">
            <h1 className="font-bold uppercase">{className}</h1>
            <div className="info">
              {date && (
                <p>
                  <strong>Data:</strong> {date}
                </p>
              )}
              {instructor && (
                <p>
                  <strong>Instrutor:</strong> {instructor}
                </p>
              )}
              <p>
                <strong>Total de Inscritos:</strong> {students.length}
              </p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th style={{ width: '5%' }}>#</th>
                <th style={{ width: '45%' }}>Nome do Aluno</th>
                <th style={{ width: '20%' }}>CPF</th>
                <th style={{ width: '30%' }}>Assinatura</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>
                  <td>{student.name}</td>
                  <td>{student.cpf}</td>
                  <td></td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Nenhum aluno inscrito nesta turma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="footer">
            <div className="signature-box">
              <div className="signature-line"></div>
              <span className="text-sm">Instrutor Responsável</span>
            </div>
            <div className="signature-box">
              <div className="signature-line"></div>
              <span className="text-sm">Coordenação</span>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4 pt-2 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
