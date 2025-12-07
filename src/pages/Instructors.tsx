import { useEffect, useState } from 'react'
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
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { domainApi, Instructor, Unit } from '@/services/domain-api'
import {
  InstructorFormDialog,
  InstructorFormValues,
} from '@/components/instructors/InstructorFormDialog'

export default function Instructors() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedInstructor, setSelectedInstructor] =
    useState<Instructor | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instructorsData, unitsData] = await Promise.all([
          domainApi.getInstructors(),
          domainApi.getUnits(),
        ])
        setInstructors(instructorsData)
        setUnits(unitsData)
      } catch (error) {
        console.error('Failed to fetch data', error)
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar os instrutores.',
        })
      }
    }
    fetchData()
  }, [toast])

  const handleAddClick = () => {
    setDialogMode('add')
    setSelectedInstructor(null)
    setDialogOpen(true)
  }

  const handleEditClick = (instructor: Instructor) => {
    setDialogMode('edit')
    setSelectedInstructor(instructor)
    setDialogOpen(true)
  }

  const handleStatusChange = (id: string, currentStatus: boolean) => {
    setInstructors((prev) =>
      prev.map((i) =>
        i.id_instrutor === id ? { ...i, ativo: !currentStatus } : i,
      ),
    )
    toast({
      title: 'Status atualizado',
      description: `Instrutor ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`,
    })
  }

  const handleFormSubmit = (data: InstructorFormValues) => {
    if (dialogMode === 'add') {
      const newInstructor: Instructor = {
        id_instrutor: String(Date.now()),
        ativo: true,
        ...data,
      }
      setInstructors((prev) => [...prev, newInstructor])
      toast({
        title: 'Instrutor criado',
        description: `${data.nome} foi cadastrado com sucesso.`,
      })
    } else if (dialogMode === 'edit' && selectedInstructor) {
      setInstructors((prev) =>
        prev.map((i) =>
          i.id_instrutor === selectedInstructor.id_instrutor
            ? { ...i, ...data }
            : i,
        ),
      )
      toast({
        title: 'Instrutor atualizado',
        description: `Os dados de ${data.nome} foram atualizados.`,
      })
    }
  }

  const getUnitName = (unitId: string) => {
    const unit = units.find((u) => u.id_unidade === unitId)
    return unit ? unit.nome : 'Unidade desconhecida'
  }

  const filteredInstructors = instructors.filter(
    (i) =>
      i.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.cargo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.area_atuacao?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Instrutores
          </h1>
          <p className="text-muted-foreground">
            Gerencie o corpo docente responsável pelos treinamentos.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Novo Instrutor
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo ou área..."
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
                <TableHead>Cargo</TableHead>
                <TableHead>Área de Atuação</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((instructor) => (
                  <TableRow key={instructor.id_instrutor}>
                    <TableCell className="font-medium">
                      {instructor.nome}
                    </TableCell>
                    <TableCell>{instructor.cargo || '-'}</TableCell>
                    <TableCell>{instructor.area_atuacao || '-'}</TableCell>
                    <TableCell>{getUnitName(instructor.unidade_id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          'hover:bg-opacity-80 border-transparent text-white',
                          instructor.ativo
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-red-500 hover:bg-red-600',
                        )}
                      >
                        {instructor.ativo ? 'Ativo' : 'Inativo'}
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
                            onClick={() => handleEditClick(instructor)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              instructor.ativo
                                ? 'text-destructive'
                                : 'text-primary'
                            }
                            onClick={() =>
                              handleStatusChange(
                                instructor.id_instrutor,
                                instructor.ativo,
                              )
                            }
                          >
                            {instructor.ativo ? 'Inativar' : 'Ativar'}
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
                    Nenhum instrutor encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InstructorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        instructor={selectedInstructor}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
