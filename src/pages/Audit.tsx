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

const logs = [
  {
    id: 1,
    date: '15/10/2024 10:30',
    user: 'Admin',
    action: 'UPDATE',
    entity: 'Profissional',
    details: 'Alterou status de Carlos para Inativo',
  },
  {
    id: 2,
    date: '15/10/2024 10:25',
    user: 'Sistema',
    action: 'CREATE',
    entity: 'Agendamento',
    details: 'Novo agendamento via WhatsApp (ID: 554)',
  },
  {
    id: 3,
    date: '15/10/2024 09:15',
    user: 'Admin',
    action: 'DELETE',
    entity: 'Turma',
    details: 'Removeu Turma Cancelada #99',
  },
]

export default function Audit() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Auditoria</h1>
        <p className="text-muted-foreground">
          Log de atividades e segurança do sistema.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logs do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Entidade</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.date}
                  </TableCell>
                  <TableCell className="font-medium">{log.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{log.action}</Badge>
                  </TableCell>
                  <TableCell>{log.entity}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {log.details}
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
