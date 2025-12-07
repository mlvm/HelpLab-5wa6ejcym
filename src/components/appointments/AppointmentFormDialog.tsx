import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
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
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useClassStatus } from '@/contexts/ClassStatusContext'

const formSchema = z.object({
  prof: z.string().min(2, 'Nome do profissional é obrigatório'),
  cpf: z.string().min(11, 'CPF inválido ou incompleto'),
  unit: z.string().min(2, 'Unidade é obrigatória'),
  role: z.string().min(2, 'Cargo é obrigatório'),
  training: z.string().min(2, 'Nome do treinamento é obrigatório'),
  date: z.date({ required_error: 'Data é obrigatória' }),
  channel: z.string().min(1, 'Canal é obrigatório'),
  status: z.string().min(1, 'Status é obrigatório'),
})

export type AppointmentFormValues = z.infer<typeof formSchema>

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  initialData?: any
  onSubmit: (data: AppointmentFormValues) => void
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSubmit,
}: AppointmentFormDialogProps) {
  const { statuses } = useClassStatus()

  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prof: '',
      cpf: '',
      unit: '',
      role: '',
      training: '',
      date: undefined,
      channel: 'WhatsApp',
      status: 'Agendado',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        // Parse date from string "dd/MM/yyyy"
        let dateObj = undefined
        if (typeof initialData.date === 'string') {
          const parts = initialData.date.split('/')
          if (parts.length === 3) {
            dateObj = new Date(
              parseInt(parts[2]),
              parseInt(parts[1]) - 1,
              parseInt(parts[0]),
            )
          }
        }

        form.reset({
          prof: initialData.prof,
          cpf: initialData.professional?.cpf || '', // Assuming linked data might be available
          unit: initialData.professional?.unit || '',
          role: initialData.professional?.role || '',
          training: initialData.training,
          date: dateObj,
          channel: initialData.channel,
          status: initialData.status,
        })
      } else {
        form.reset({
          prof: '',
          cpf: '',
          unit: '',
          role: '',
          training: '',
          date: undefined,
          channel: 'WhatsApp',
          status: 'Agendado',
        })
      }
    }
  }, [open, mode, initialData, form])

  const handleSubmit = (data: AppointmentFormValues) => {
    onSubmit(data)
    onOpenChange(false)
  }

  const title = mode === 'add' ? 'Novo Agendamento' : 'Editar Agendamento'
  const description =
    mode === 'add'
      ? 'Preencha os dados para criar um novo agendamento.'
      : 'Atualize os dados do agendamento existente.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-4"
          >
            {/* Professional Data Section */}
            <div className="space-y-4 border-b pb-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Dados do Profissional
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="prof"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do profissional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cpf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CPF</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="000.000.000-00"
                          {...field}
                          disabled={mode === 'edit'} // Usually ID keys aren't editable
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Enfermeiro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Unidade de Saúde</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Hospital Central" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Appointment Data Section */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                Dados do Agendamento
              </h4>
              <FormField
                control={form.control}
                name="training"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Treinamento</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do treinamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-2">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione a data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="channel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="Email">Email</SelectItem>
                          <SelectItem value="Telefone">Telefone</SelectItem>
                          <SelectItem value="Presencial">Presencial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.name}>
                            {status.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">
                {mode === 'add' ? 'Criar Agendamento' : 'Salvar Alterações'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
