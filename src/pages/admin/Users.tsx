import { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Key,
  Loader2,
  MoreHorizontal,
  Shield,
  ShieldAlert,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { adminService } from '@/services/admin-service'
import { User } from '@/types/user'
import {
  UserFormDialog,
  UserFormValues,
} from '@/components/admin/UserFormDialog'
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog'
import { toast } from 'sonner'

export default function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog States
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await adminService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error(error)
      toast.error(
        'Erro ao carregar usuários. Verifique se você tem permissão de administrador.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddClick = () => {
    setDialogMode('add')
    setSelectedUser(null)
    setUserDialogOpen(true)
  }

  const handleEditClick = (user: User) => {
    setDialogMode('edit')
    setSelectedUser(user)
    setUserDialogOpen(true)
  }

  const handleChangePasswordClick = (user: User) => {
    setSelectedUser(user)
    setPasswordDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user)
    setDeleteDialogOpen(true)
  }

  const handleUserSubmit = async (data: UserFormValues) => {
    try {
      if (dialogMode === 'add') {
        await adminService.createUser({
          ...data,
          status: data.status as 'active' | 'inactive',
          password: data.password!,
        })
        toast.success('Usuário criado com sucesso.')
      } else if (selectedUser) {
        await adminService.updateUser({
          id: selectedUser.id,
          ...data,
          status: data.status as 'active' | 'inactive',
        })
        toast.success('Usuário atualizado com sucesso.')
      }
      fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar usuário.')
    }
  }

  const handlePasswordSubmit = async (password: string) => {
    if (selectedUser) {
      try {
        await adminService.changePassword(selectedUser.id, password)
        toast.success('Senha alterada com sucesso.')
      } catch (error) {
        console.error(error)
        toast.error('Erro ao alterar senha.')
      }
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      try {
        await adminService.deactivateUser(selectedUser.id)
        toast.success('Usuário inativado com sucesso.')
        fetchUsers()
      } catch (error) {
        console.error(error)
        toast.error('Erro ao inativar usuário.')
      } finally {
        setDeleteDialogOpen(false)
      }
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.cpf.includes(searchQuery),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gerenciamento de Usuários
          </h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários do sistema, incluindo suas informações
            pessoais e status.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
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
                <TableHead>Email (Login)</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Carregando...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      {user.name}
                      {user.role === 'admin' && (
                        <Shield className="h-3 w-3 text-primary" />
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || '-'}</TableCell>
                    <TableCell>{user.cpf}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === 'active' ? 'default' : 'secondary'
                        }
                        className={
                          user.status === 'active'
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-gray-500'
                        }
                      >
                        {user.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Editar"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Alterar Senha"
                          onClick={() => handleChangePasswordClick(user)}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Desativar"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(user)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserFormDialog
        open={userDialogOpen}
        onOpenChange={setUserDialogOpen}
        mode={dialogMode}
        user={selectedUser}
        onSubmit={handleUserSubmit}
      />

      <ChangePasswordDialog
        open={passwordDialogOpen}
        onOpenChange={setPasswordDialogOpen}
        user={selectedUser}
        onSubmit={handlePasswordSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja desativar o usuário{' '}
              <strong>{selectedUser?.name}</strong>? Ele perderá acesso ao
              sistema imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
