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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Plus, FileUp, Download, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Professional, ProfessionalStatus } from '@/types/professional'
import {
  ProfessionalFormDialog,
  ProfessionalFormValues,
} from '@/components/professionals/ProfessionalFormDialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { domainApi, Unit } from '@/services/domain-api'

const INITIAL_DATA: Professional[] = [
  {
    id: 1,
    name: 'Ana Clara Souza',
    cpf: '123.456.789-00',
    whatsapp: '+55 11 99999-0001',
    unit: '2', // Hospital Geral
    role: 'Enfermeira',
    status: 'Ativo',
  },
  {
    id: 2,
    name: 'Carlos Eduardo',
    cpf: '987.654.321-11',
    whatsapp: '+55 11 98888-0002',
    unit: '3', // UBS Centro
    role: 'Técnico',
    status: 'Inativo',
  },
  {
    id: 3,
    name: 'Fernanda Lima',
    cpf: '456.789.123-22',
    whatsapp: '+55 11 97777-0003',
    unit: '1', // LACEN
    role: 'Biomédica',
    status: 'Ativo',
  },
  {
    id: 4,
    name: 'Roberto Alves',
    cpf: '321.654.987-33',
    unit: '4', // Hospital Infantil
    role: 'Médico',
    status: 'Bloqueado',
  },
  {
    id: 5,
    name: 'Juliana Paes',
    cpf: '741.852.963-44',
    whatsapp: '+55 11 96666-0005',
    unit: '5', // UBS Norte
    role: 'Enfermeira',
    status: 'Ativo',
  },
]

export default function Professionals() {
  const [professionals, setProfessionals] =
    useState<Professional[]>(INITIAL_DATA)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [units, setUnits] = useState<Unit[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await domainApi.getUnits()
        setUnits(data)
      } catch (error) {
        console.error('Failed to fetch units', error)
      }
    }
    fetchUnits()
  }, [])

  const handleAddClick = () => {
    setDialogMode('add')
    setSelectedProfessional(null)
    setDialogOpen(true)
  }

  const handleEditClick = (professional: Professional) => {
    setDialogMode('edit')
    setSelectedProfessional(professional)
    setDialogOpen(true)
  }

  const handleViewClick = (professional: Professional) => {
    setDialogMode('view')
    setSelectedProfessional(professional)
    setDialogOpen(true)
  }

  const handleStatusChange = (
    id: number,
    currentStatus: ProfessionalStatus,
  ) => {
    const newStatus: ProfessionalStatus =
      currentStatus === 'Ativo' ? 'Inativo' : 'Ativo'

    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    )

    toast({
      title: 'Status atualizado',
      description: `O profissional foi ${newStatus === 'Ativo' ? 'ativado' : 'inativado'} com sucesso.`,
    })
  }

  const handleFormSubmit = (data: ProfessionalFormValues) => {
    if (dialogMode === 'add') {
      const newId = Math.max(...professionals.map((p) => p.id), 0) + 1
      const newProfessional: Professional = {
        id: newId,
        status: 'Ativo',
        ...data,
      }
      setProfessionals((prev) => [...prev, newProfessional])
      toast({
        title: 'Profissional adicionado',
        description: `${data.name} foi cadastrado com sucesso.`,
      })
    } else if (dialogMode === 'edit' && selectedProfessional) {
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === selectedProfessional.id ? { ...p, ...data } : p,
        ),
      )
      toast({
        title: 'Profissional atualizado',
        description: `Os dados de ${data.name} foram atualizados.`,
      })
    }
  }

  const filteredProfessionals = professionals.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cpf.includes(searchQuery) ||
      p.role.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && p.status === 'Ativo') ||
      (statusFilter === 'inactive' && p.status !== 'Ativo')

    const matchesUnit = unitFilter === 'all' || p.unit === unitFilter

    return matchesSearch && matchesStatus && matchesUnit
  })

  const getUnitName = (unitId: string) => {
    const unit = units.find((u) => u.id_unidade === unitId)
    return unit ? unit.nome : unitId
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Profissionais
          </h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro e status dos profissionais de saúde.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <FileUp className="mr-2 h-4 w-4" /> Importar
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button onClick={handleAddClick}>
            <Plus className="mr-2 h-4 w-4" /> Novo Profissional
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou cargo..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Unidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Unidades</SelectItem>
                  {units.map((unit) => (
                    <SelectItem key={unit.id_unidade} value={unit.id_unidade}>
                      {unit.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">
                      {professional.name}
                    </TableCell>
                    <TableCell>{professional.cpf}</TableCell>
                    <TableCell>{getUnitName(professional.unit)}</TableCell>
                    <TableCell>{professional.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          'hover:bg-opacity-80 border-transparent text-white',
                          professional.status === 'Ativo'
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-red-500 hover:bg-red-600',
                        )}
                      >
                        {professional.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleViewClick(professional)}
                          >
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEditClick(professional)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              professional.status === 'Ativo'
                                ? 'text-destructive'
                                : 'text-primary'
                            }
                            onClick={() =>
                              handleStatusChange(
                                professional.id,
                                professional.status,
                              )
                            }
                          >
                            {professional.status === 'Ativo'
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
                    Nenhum profissional encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ProfessionalFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        professional={selectedProfessional}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
