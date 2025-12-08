import { useEffect, useState, useCallback } from 'react'
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
import {
  Search,
  Plus,
  FileUp,
  MoreHorizontal,
  Pencil,
  Ban,
  CheckCircle,
  Loader2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  ProfessionalFormDialog,
  ProfessionalFormValues,
} from '@/components/professionals/ProfessionalFormDialog'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { domainApi, Unit } from '@/services/domain-api'
import { db } from '@/services/database'
import { Professional } from '@/types/db-types'

export default function Professionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [unitFilter, setUnitFilter] = useState('all')
  const [units, setUnits] = useState<Unit[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedProfessional, setSelectedProfessional] =
    useState<Professional | null>(null)

  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [profsData, unitsData] = await Promise.all([
        db.getProfessionals(),
        domainApi.getUnits(),
      ])
      setProfessionals(profsData)
      setUnits(unitsData)
    } catch (error) {
      console.error('Failed to fetch data', error)
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao carregar profissionais.',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const handleStatusChange = async (professional: Professional) => {
    const newStatus = professional.status === 'Ativo' ? 'Inativo' : 'Ativo'
    const oldStatus = professional.status

    setProfessionals((prev) =>
      prev.map((p) =>
        p.id === professional.id ? { ...p, status: newStatus } : p,
      ),
    )

    try {
      await db.upsertProfessional({
        name: professional.name,
        cpf: professional.cpf,
        whatsapp: professional.whatsapp,
        unit_id: professional.unit_id,
        role: professional.role,
      })

      toast({
        title: 'Status atualizado',
        description: `Profissional ${newStatus === 'Ativo' ? 'ativado' : 'inativado'}.`,
      })
    } catch (e) {
      setProfessionals((prev) =>
        prev.map((p) =>
          p.id === professional.id ? { ...p, status: oldStatus } : p,
        ),
      )
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar status.',
      })
    }
  }

  const handleFormSubmit = async (data: ProfessionalFormValues) => {
    try {
      await db.upsertProfessional({
        name: data.name,
        cpf: data.cpf,
        whatsapp: data.whatsapp,
        unit_id: data.unit, // unit form value is the ID
        role: data.role,
      })
      await fetchData()
      toast({
        title: 'Sucesso',
        description: `Dados de ${data.name} salvos com sucesso.`,
      })
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Erro ao salvar profissional.',
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

    const matchesUnit = unitFilter === 'all' || p.unit_id === unitFilter

    return matchesSearch && matchesStatus && matchesUnit
  })

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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredProfessionals.length > 0 ? (
                filteredProfessionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">
                      {professional.name}
                    </TableCell>
                    <TableCell>{professional.cpf}</TableCell>
                    <TableCell>{professional.unit?.name || '-'}</TableCell>
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
                            onClick={() => handleEditClick(professional)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              professional.status === 'Ativo'
                                ? 'text-destructive'
                                : 'text-primary'
                            }
                            onClick={() => handleStatusChange(professional)}
                          >
                            {professional.status === 'Ativo' ? (
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
        professional={selectedProfessional as any}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
