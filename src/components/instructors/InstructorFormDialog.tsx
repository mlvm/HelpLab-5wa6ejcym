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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Instructor, Unit, domainApi } from '@/services/domain-api'

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF inválido').optional().or(z.literal('')),
  cargo: z.string().min(2, 'Cargo é obrigatório'),
  unidade_id: z.string().min(1, 'Unidade é obrigatória'),
  area_atuacao: z.string().optional(),
})

export type InstructorFormValues = z.infer<typeof formSchema>

interface InstructorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  instructor?: Instructor | null
  onSubmit: (data: InstructorFormValues) => void
}

export function InstructorFormDialog({
  open,
  onOpenChange,
  mode,
  instructor,
  onSubmit,
}: InstructorFormDialogProps) {
  const [units, setUnits] = useState<Unit[]>([])

  const form = useForm<InstructorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      cpf: '',
      cargo: '',
      unidade_id: '',
      area_atuacao: '',
    },
  })

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await domainApi.getUnits()
        setUnits(data)
      } catch (error) {
        console.error('Failed to fetch units', error)
      }
    }
    if (open) {
      fetchUnits()
    }
  }, [open])

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          nome: '',
          cpf: '',
          cargo: '',
          unidade_id: '',
          area_atuacao: '',
        })
      } else if (instructor) {
        form.reset({
          nome: instructor.nome,
          cpf: instructor.cpf || '',
          cargo: instructor.cargo || '',
          unidade_id: instructor.unidade_id,
          area_atuacao: instructor.area_atuacao || '',
        })
      }
    }
  }, [open, mode, instructor, form])

  const handleSubmit = (data: InstructorFormValues) => {
    onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Novo Instrutor' : 'Editar Instrutor'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Cadastre um novo instrutor para ministrar treinamentos.'
              : 'Atualize os dados do instrutor.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid gap-4 py-4"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Dr. João Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
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
                name="unidade_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade de Origem</FormLabel>
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
                        {units.map((unit) => (
                          <SelectItem
                            key={unit.id_unidade}
                            value={unit.id_unidade}
                          >
                            {unit.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cargo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Médico" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="area_atuacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área de Atuação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Infectologia" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
