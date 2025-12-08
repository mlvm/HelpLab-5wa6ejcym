import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Loader2,
  Save,
  User,
  Shield,
  Lock,
  Ban,
  Edit2,
  Camera,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { profileService, Profile } from '@/services/profile-service'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

const personalDataSchema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().optional(),
  unit: z.string().optional(),
})

const passwordSchema = z
  .object({
    password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme a senha'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function Account() {
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const { toast } = useToast()

  const personalForm = useForm<z.infer<typeof personalDataSchema>>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      unit: '',
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const data = await profileService.getProfile()
      if (data) {
        setProfile(data)
        personalForm.reset({
          name: data.name,
          cpf: data.cpf,
          phone: data.phone || '',
          unit: data.unit || '',
        })
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar perfil',
        description: 'Não foi possível buscar seus dados.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onPersonalSubmit = async (data: z.infer<typeof personalDataSchema>) => {
    setIsSaving(true)
    try {
      await profileService.updateProfile(data)
      setProfile((prev) => (prev ? { ...prev, ...data } : null))
      setIsEditing(false)
      toast({
        title: 'Perfil atualizado',
        description: 'Seus dados pessoais foram salvos com sucesso.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao atualizar seu perfil.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    setIsSaving(true)
    try {
      await profileService.updatePassword(data.password)
      passwordForm.reset()
      toast({
        title: 'Senha alterada',
        description: 'Sua senha foi atualizada com sucesso.',
      })
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar senha',
        description: 'Não foi possível atualizar sua senha.',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInactivate = async () => {
    try {
      await profileService.inactivateAccount()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível inativar sua conta.',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuário</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie suas informações pessoais e de acesso.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Left Column - Avatar & Personal Data */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Dados Pessoais</CardTitle>
                </div>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" /> Editar
                  </Button>
                )}
              </div>
              <CardDescription>
                Informações de identificação do usuário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                  <Avatar className="h-24 w-24 border-2 border-border">
                    <AvatarImage
                      src={
                        profile?.avatar_url ||
                        'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=1'
                      }
                    />
                    <AvatarFallback className="text-2xl">
                      {profile?.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Camera className="h-6 w-6" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Clique para alterar a foto
                </p>
              </div>

              <Form {...personalForm}>
                <form
                  onSubmit={personalForm.handleSubmit(onPersonalSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={personalForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={personalForm.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="000.000.000-00"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={personalForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="(00) 00000-0000"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={personalForm.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade de Lotação</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="Ex: Hospital Geral"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsEditing(false)
                          personalForm.reset()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSaving}>
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Salvar Alterações
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Access Data */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle>Dados de Acesso</CardTitle>
              </div>
              <CardDescription>
                Credenciais e segurança da conta.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile?.email || ''} disabled readOnly />
                <p className="text-xs text-muted-foreground">
                  Para alterar seu email, entre em contato com o suporte.
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Alterar Senha
                </h3>
                <Form {...passwordForm}>
                  <form
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nova Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="••••••••"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              {...field}
                              placeholder="••••••••"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      className="w-full"
                      disabled={isSaving}
                    >
                      {isSaving && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Atualizar Senha
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
            <CardFooter className="bg-destructive/5 border-t border-destructive/20 pt-6">
              <div className="w-full space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-destructive/10 rounded-full">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <h4 className="font-medium text-destructive">
                      Zona de Perigo
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Inativar sua conta impedirá o acesso ao sistema
                      imediatamente.
                    </p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Ban className="mr-2 h-4 w-4" /> Inativar Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá inativar sua conta e encerrar sua sessão
                        atual. Você precisará contatar um administrador para
                        reativar seu acesso.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleInactivate}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Sim, inativar minha conta
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
