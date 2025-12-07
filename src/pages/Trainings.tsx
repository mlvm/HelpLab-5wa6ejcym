import { useState } from 'react'
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
import { Search, Plus, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Training, TrainingStatus } from '@/types/training'
import {
  TrainingFormDialog,
  TrainingFormValues,
} from '@/components/trainings/TrainingFormDialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export const INITIAL_TRAININGS: Training[] = [
  {
    id: 1,
    name: 'Biossegurança Básica',
    hours: '4h',
    capacity: 30,
    status: 'Ativo',
    description: 'Curso introdutório sobre biossegurança.',
    instructor: 'Dr. Silva',
  },
  {
    id: 2,
    name: 'Primeiros Socorros Avançados',
    hours: '8h',
    capacity: 20,
    status: 'Ativo',
    description: 'Técnicas avançadas de primeiros socorros.',
    instructor: 'Enf. Maria',
  },
  {
    id: 3,
    name: 'Gestão de Resíduos Sólidos',
    hours: '6h',
    capacity: 25,
    status: 'Inativo',
    description: 'Gerenciamento adequado de resíduos de saúde.',
    instructor: 'Eng. Roberto',
  },
  {
    id: 4,
    name: 'Coleta e Transporte de Amostras',
    hours: '4h',
    capacity: 30,
    status: 'Ativo',
    description: 'Procedimentos para coleta segura.',
    instructor: 'Bio. Carla',
  },
]

export default function Trainings() {
  const [trainings, setTrainings] = useState<Training[]>(INITIAL_TRAININGS)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  )

  const { toast } = useToast()

  const handleAddClick = () => {
    setDialogMode('add')
    setSelectedTraining(null)
    setDialogOpen(true)
  }

  const handleEditClick = (training: Training) => {
    setDialogMode('edit')
    setSelectedTraining(training)
    setDialogOpen(true)
  }

  const handleStatusChange = (id: number, currentStatus: TrainingStatus) => {
    const newStatus: TrainingStatus =
      currentStatus === 'Ativo' ? 'Inativo' : 'Ativo'

    setTrainings((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)),
    )

    toast({
      title: 'Status atualizado',
      description: `O treinamento foi ${newStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso.`,
    })
  }

  const handleFormSubmit = (data: TrainingFormValues) => {
    if (dialogMode === 'add') {
      const newId = Math.max(...trainings.map((t) => t.id), 0) + 1
      const newTraining: Training = {
        id: newId,
        status: 'Ativo',
        ...data,
      }
      setTrainings((prev) => [...prev, newTraining])
      toast({
        title: 'Treinamento criado',
        description: `${data.name} foi cadastrado com sucesso.`,
      })
    } else if (dialogMode === 'edit' && selectedTraining) {
      setTrainings((prev) =>
        prev.map((t) => (t.id === selectedTraining.id ? { ...t, ...data } : t)),
      )
      toast({
        title: 'Treinamento atualizado',
        description: `Os dados de ${data.name} foram atualizados.`,
      })
    }
  }

  const filteredTrainings = trainings.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Criar Treinamento
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar treinamento..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Instrutor</TableHead>
                <TableHead>Carga Horária</TableHead>
                <TableHead>Capacidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrainings.length > 0 ? (
                filteredTrainings.map((training) => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{training.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {training.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{training.instructor || '-'}</TableCell>
                    <TableCell>{training.hours}</TableCell>
                    <TableCell>{training.capacity} alunos</TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          'hover:bg-opacity-80 border-transparent text-white',
                          training.status === 'Ativo'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-red-500 hover:bg-red-600',
                        )}
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
                          <DropdownMenuItem
                            onClick={() => handleEditClick(training)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              training.status === 'Ativo'
                                ? 'text-destructive'
                                : 'text-primary'
                            }
                            onClick={() =>
                              handleStatusChange(training.id, training.status)
                            }
                          >
                            {training.status === 'Ativo'
                              ? 'Inativar'
                              : 'Ativar'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum treinamento encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <TrainingFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        training={selectedTraining}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
