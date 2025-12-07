import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Training } from '@/types/training'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  hours: z.string().min(1, 'Carga horária é obrigatória'),
  capacity: z.coerce.number().min(1, 'Capacidade deve ser maior que 0'),
  description: z.string().optional(),
})

export type TrainingFormValues = z.infer<typeof formSchema>

interface TrainingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  training?: Training | null
  onSubmit: (data: TrainingFormValues) => void
}

export function TrainingFormDialog({
  open,
  onOpenChange,
  mode,
  training,
  onSubmit,
}: TrainingFormDialogProps) {
  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hours: '',
      capacity: 0,
      description: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          name: '',
          hours: '',
          capacity: 0,
          description: '',
        })
      } else if (training) {
        form.reset({
          name: training.name,
          hours: training.hours,
          capacity: training.capacity,
          description: training.description || '',
        })
      }
    }
  }, [open, mode, training, form])

  const handleSubmit = (data: TrainingFormValues) => {
    onSubmit(data)
    onOpenChange(false)
  }

  const title = mode === 'add' ? 'Novo Treinamento' : 'Editar Treinamento'
  const description =
    mode === 'add'
      ? 'Cadastre um novo treinamento no catálogo.'
      : 'Atualize os dados do treinamento.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Nome</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input placeholder="Ex: Biossegurança" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carga Horária</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 4h" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="30" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Descrição</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input placeholder="Breve descrição..." {...field} />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
