import { useEffect, useState } from 'react'
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
import { Training } from '@/types/db-types'
import { Loader2, Upload } from 'lucide-react'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  hours: z.string().min(1, 'Carga horária é obrigatória'),
  capacity: z.coerce.number().min(1, 'Capacidade deve ser maior que 0'),
  description: z.string().optional(),
  instructor: z.string().optional(),
})

export type TrainingFormValues = z.infer<typeof formSchema>

interface TrainingFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  training?: Training | null
  onSubmit: (data: TrainingFormValues) => void // Note: This prop doesn't handle file, we handle it internally or change signature?
  // The parent handles submission. I need to pass the file up or handle it here.
  // I'll update signature to allow file passing or rely on parent using a different prop,
  // but to keep it simple I will rely on the parent (Trainings.tsx) to adapt,
  // but wait, I can't change Trainings.tsx in this file.
  // I updated Trainings.tsx earlier to use trainingService.
  // But Trainings.tsx calls onSubmit with just 'data'.
  // I need to change how data is passed back.
  // I will add an optional file argument to onSubmit in this component, and update Trainings.tsx later?
  // No, I can't update Trainings.tsx AGAIN if I already finalized it in previous turn.
  // Wait, I updated Trainings.tsx in THIS turn (Turn 2).
  // I did NOT update it to handle file upload in Turn 2. I only updated it to use trainingService.
  // I need to update Trainings.tsx to accept file.
}

// I will overload the onSubmit type to include file
interface ExtendedProps extends Omit<TrainingFormDialogProps, 'onSubmit'> {
  onSubmit: (data: TrainingFormValues, file?: File) => void
}

export function TrainingFormDialog({
  open,
  onOpenChange,
  mode,
  training,
  onSubmit,
}: ExtendedProps) {
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined)

  const form = useForm<TrainingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      hours: '',
      capacity: 0,
      description: '',
      instructor: '',
    },
  })

  useEffect(() => {
    if (open) {
      setSelectedFile(undefined)
      if (mode === 'add') {
        form.reset({
          name: '',
          hours: '',
          capacity: 0,
          description: '',
          instructor: '',
        })
      } else if (training) {
        form.reset({
          name: training.name,
          hours: training.hours,
          capacity: training.capacity,
          description: training.description || '',
          instructor: (training.instructor as any) || '', // simplistic handling of instructor name/id
        })
      }
    }
  }, [open, mode, training, form])

  const handleSubmit = (data: TrainingFormValues) => {
    onSubmit(data, selectedFile)
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
              name="instructor"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Instrutor</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input placeholder="Ex: Dr. Silva" {...field} />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

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

            <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
              <FormLabel className="text-right">Material</FormLabel>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    className="cursor-pointer"
                    onChange={(e) => setSelectedFile(e.target.files?.[0])}
                  />
                </div>
                {training?.material_url && !selectedFile && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Arquivo atual:{' '}
                    <a
                      href={training.material_url}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      Download
                    </a>
                  </p>
                )}
              </div>
            </FormItem>

            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
