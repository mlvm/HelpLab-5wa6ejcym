import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const trainings = [
  {
    id: 1,
    name: 'Biossegurança Básica',
    hours: '4h',
    capacity: 30,
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Primeiros Socorros Avançados',
    hours: '8h',
    capacity: 20,
    status: 'Ativo',
  },
  {
    id: 3,
    name: 'Gestão de Resíduos Sólidos',
    hours: '6h',
    capacity: 25,
    status: 'Inativo',
  },
  {
    id: 4,
    name: 'Coleta e Transporte de Amostras',
    hours: '4h',
    capacity: 30,
    status: 'Ativo',
  },
]

export default function Trainings() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Catálogo de Treinamentos
          </h1>
          <p className="text-muted-foreground">
            Gerencie os cursos e capacitações disponíveis.
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Criar Treinamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Treinamento</DialogTitle>
              <DialogDescription>
                Cadastre um novo treinamento no catálogo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome do Treinamento</Label>
                <Input id="name" placeholder="Ex: Biossegurança" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hours">Carga Horária</Label>
                  <Input id="hours" placeholder="Ex: 4h" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Capacidade Máxima</Label>
                  <Input id="capacity" type="number" placeholder="30" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Descrição</Label>
                <Input id="desc" placeholder="Breve descrição..." />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar treinamento..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Carga Horária</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainings.map((training) => (
                <TableRow key={training.id}>
                  <TableCell className="font-medium">{training.name}</TableCell>
                  <TableCell>{training.hours}</TableCell>
                  <TableCell>{training.capacity} alunos</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        training.status === 'Ativo' ? 'default' : 'secondary'
                      }
                    >
                      {training.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Ver Turmas</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
