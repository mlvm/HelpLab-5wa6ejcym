import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Camera } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { User } from '@/types/user'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().optional(),
  unit: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  password: z.string().optional(), // Required only for create
})

export type UserFormValues = z.infer<typeof formSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  user?: User | null
  onSubmit: (data: UserFormValues) => Promise<void>
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  onSubmit,
}: UserFormDialogProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(
      formSchema.refine(
        (data) => {
          if (mode === 'add' && !data.password) return false
          return true
        },
        {
          message: 'Senha é obrigatória para novos usuários',
          path: ['password'],
        },
      ),
    ),
    defaultValues: {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      unit: '',
      status: 'active',
      password: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          name: '',
          email: '',
          cpf: '',
          phone: '',
          unit: '',
          status: 'active',
          password: '',
        })
      } else if (user) {
        form.reset({
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          phone: user.phone || '',
          unit: user.unit || '',
          status: user.status,
          password: '', // Password not editable here for security, only in reset flow
        })
      }
    }
  }, [open, mode, user, form])

  const handleSubmit = async (data: UserFormValues) => {
    await onSubmit(data)
    onOpenChange(false)
  }

  const isSubmitting = form.formState.isSubmitting

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Adicionar Novo Usuário' : 'Editar Usuário'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Preencha os dados para criar um novo usuário no sistema.'
              : 'Atualize as informações do usuário. O email não pode ser alterado.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4 py-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Ana Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Login)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="email@exemplo.com"
                          {...field}
                          disabled={mode === 'edit'}
                          className={
                            mode === 'edit'
                              ? 'bg-muted text-muted-foreground'
                              : ''
                          }
                        />
                      </FormControl>
                      {mode === 'edit' && (
                        <FormDescription>
                          O email serve como identificador único e não pode ser
                          alterado aqui.
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {mode === 'add' && (
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Hospital Central" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 w-full bg-muted/20">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Status</FormLabel>
                        <FormDescription>
                          {field.value === 'active'
                            ? 'Usuário Ativo'
                            : 'Usuário Inativo'}
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value === 'active'}
                          onCheckedChange={(checked) =>
                            field.onChange(checked ? 'active' : 'inactive')
                          }
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-2">
              <FormLabel>Avatar</FormLabel>
              <div className="flex items-center gap-4 p-4 border rounded-md border-dashed bg-muted/10">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-2 border-background shadow-sm">
                  <Camera className="h-6 w-6 opacity-50" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Foto do Perfil</p>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload de imagem será habilitado em breve.
                  </p>
                  <Button type="button" variant="outline" size="sm" disabled>
                    Carregar Imagem
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {mode === 'add' ? 'Criar Usuário' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
