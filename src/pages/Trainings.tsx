import { useState, useEffect, useCallback } from 'react'
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
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Ban,
  CheckCircle,
  Loader2,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Training } from '@/types/db-types'
import {
  TrainingFormDialog,
  TrainingFormValues,
} from '@/components/trainings/TrainingFormDialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { trainingService } from '@/services/training-service'

export default function Trainings() {
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(
    null,
  )

  const { toast } = useToast()

  const fetchTrainings = useCallback(async () => {
    setLoading(true)
    try {
      const data = await trainingService.getTrainings()
      setTrainings(data)
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao buscar treinamentos.',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchTrainings()
  }, [fetchTrainings])

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

  const handleStatusChange = async (training: Training) => {
    const newStatus = training.status === 'Ativo' ? 'Inativo' : 'Ativo'
    const oldStatus = training.status

    setTrainings((prev) =>
      prev.map((t) => (t.id === training.id ? { ...t, status: newStatus } : t)),
    )

    try {
      await trainingService.updateTraining(training.id, { status: newStatus })
      toast({
        title: 'Status atualizado',
        description: `Treinamento ${newStatus === 'Ativo' ? 'ativado' : 'inativado'}.`,
      })
    } catch (e) {
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === training.id ? { ...t, status: oldStatus } : t,
        ),
      )
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar status.',
      })
    }
  }

  const handleFormSubmit = async (data: TrainingFormValues, file?: File) => {
    try {
      if (dialogMode === 'add') {
        await trainingService.createTraining(
          {
            name: data.name,
            hours: data.hours,
            capacity: data.capacity,
            description: data.description,
          },
          file,
        )
        toast({
          title: 'Criado',
          description: 'Treinamento criado com sucesso.',
        })
      } else if (dialogMode === 'edit' && selectedTraining) {
        await trainingService.updateTraining(
          selectedTraining.id,
          {
            name: data.name,
            hours: data.hours,
            capacity: data.capacity,
            description: data.description,
          },
          file,
        )
        toast({
          title: 'Atualizado',
          description: 'Treinamento atualizado com sucesso.',
        })
      }
      fetchTrainings()
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar.',
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
                <TableHead>Material</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredTrainings.length > 0 ? (
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
                    <TableCell>{(training.instructor as any) || '-'}</TableCell>
                    <TableCell>{training.hours}</TableCell>
                    <TableCell>{training.capacity} alunos</TableCell>
                    <TableCell>
                      {training.material_url ? (
                        <a
                          href={training.material_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Badge
                            variant="outline"
                            className="cursor-pointer hover:bg-muted"
                          >
                            <FileText className="w-3 h-3 mr-1" /> Baixar
                          </Badge>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
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
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              training.status === 'Ativo'
                                ? 'text-destructive'
                                : 'text-primary'
                            }
                            onClick={() => handleStatusChange(training)}
                          >
                            {training.status === 'Ativo' ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" /> Inativar
                              </>
                            ) : (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" /> Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
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
        training={selectedTraining as any}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
