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
  Search,
  Plus,
  MoreHorizontal,
  MapPin,
  Pencil,
  Ban,
  CheckCircle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { domainApi, Unit } from '@/services/domain-api'
import {
  UnitFormDialog,
  UnitFormValues,
} from '@/components/units/UnitFormDialog'

export default function Units() {
  const [units, setUnits] = useState<Unit[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await domainApi.getUnits()
        setUnits(data)
      } catch (error) {
        console.error('Failed to fetch units', error)
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as unidades.',
        })
      }
    }
    fetchUnits()
  }, [toast])

  const handleAddClick = () => {
    setDialogMode('add')
    setSelectedUnit(null)
    setDialogOpen(true)
  }

  const handleEditClick = (unit: Unit) => {
    setDialogMode('edit')
    setSelectedUnit(unit)
    setDialogOpen(true)
  }

  const handleStatusChange = (id: string, currentStatus: boolean) => {
    setUnits((prev) =>
      prev.map((u) =>
        u.id_unidade === id ? { ...u, ativo: !currentStatus } : u,
      ),
    )
    toast({
      title: 'Status atualizado',
      description: `Unidade ${!currentStatus ? 'ativada' : 'desativada'} com sucesso.`,
    })
  }

  const handleFormSubmit = (data: UnitFormValues) => {
    if (dialogMode === 'add') {
      const newUnit: Unit = {
        id_unidade: String(Date.now()),
        ativo: true,
        ...data,
      }
      setUnits((prev) => [...prev, newUnit])
      toast({
        title: 'Unidade criada',
        description: `${data.nome} foi cadastrada com sucesso.`,
      })
    } else if (dialogMode === 'edit' && selectedUnit) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id_unidade === selectedUnit.id_unidade ? { ...u, ...data } : u,
        ),
      )
      toast({
        title: 'Unidade atualizada',
        description: `Os dados de ${data.nome} foram atualizados.`,
      })
    }
  }

  const filteredUnits = units.filter(
    (u) =>
      u.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.sigla?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.endereco_municipio?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestão de Unidades
          </h1>
          <p className="text-muted-foreground">
            Gerencie os hospitais, laboratórios e unidades de saúde parceiras.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Nova Unidade
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar unidade por nome, sigla ou cidade..."
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
                <TableHead>Tipo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUnits.length > 0 ? (
                filteredUnits.map((unit) => (
                  <TableRow key={unit.id_unidade}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{unit.nome}</span>
                        {unit.sigla && (
                          <span className="text-xs text-muted-foreground">
                            {unit.sigla}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{unit.tipo_unidade}</Badge>
                    </TableCell>
                    <TableCell>
                      {unit.endereco_municipio ? (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <MapPin className="mr-1 h-3 w-3" />
                          {unit.endereco_municipio}
                          {unit.endereco_uf && ` - ${unit.endereco_uf}`}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className={cn(
                          'hover:bg-opacity-80 border-transparent text-white',
                          unit.ativo
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-red-500 hover:bg-red-600',
                        )}
                      >
                        {unit.ativo ? 'Ativo' : 'Inativo'}
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
                            onClick={() => handleEditClick(unit)}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className={
                              unit.ativo ? 'text-destructive' : 'text-primary'
                            }
                            onClick={() =>
                              handleStatusChange(unit.id_unidade, unit.ativo)
                            }
                          >
                            {unit.ativo ? (
                              <>
                                <Ban className="mr-2 h-4 w-4" /> Desativar
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
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhuma unidade encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UnitFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        unit={selectedUnit}
        onSubmit={handleFormSubmit}
      />
    </div>
  )
}
