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
import { ClassStatus } from '@/types/class-status'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Cor inválida (use formato hexadecimal #RRGGBB)'),
})

export type ClassStatusFormValues = z.infer<typeof formSchema>

interface ClassStatusFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  status?: ClassStatus | null
  onSubmit: (data: ClassStatusFormValues) => void
}

export function ClassStatusFormDialog({
  open,
  onOpenChange,
  mode,
  status,
  onSubmit,
}: ClassStatusFormDialogProps) {
  const form = useForm<ClassStatusFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      color: '#000000',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          name: '',
          color: '#3b82f6', // Default blue
        })
      } else if (status) {
        form.reset({
          name: status.name,
          color: status.color,
        })
      }
    }
  }, [open, mode, status, form])

  const handleSubmit = (data: ClassStatusFormValues) => {
    onSubmit(data)
    onOpenChange(false)
  }

  const title = mode === 'add' ? 'Novo Status' : 'Editar Status'
  const description =
    mode === 'add'
      ? 'Crie um novo status personalizado para as turmas.'
      : 'Atualize as informações do status.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
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
                <FormItem>
                  <FormLabel>Nome do Status</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Finalizada" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor de Exibição</FormLabel>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-md border shadow-sm"
                      style={{ backgroundColor: field.value }}
                    />
                    <FormControl>
                      <div className="flex-1 flex gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1 cursor-pointer"
                          {...field}
                        />
                        <Input
                          type="text"
                          placeholder="#000000"
                          className="font-mono uppercase"
                          {...field}
                          onChange={(e) => {
                            const val = e.target.value
                            if (
                              val.startsWith('#') &&
                              val.length <= 7 &&
                              /^[#0-9A-Fa-f]*$/.test(val)
                            ) {
                              field.onChange(e)
                            }
                          }}
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
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
