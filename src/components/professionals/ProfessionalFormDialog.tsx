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
import { Professional } from '@/types/professional'
import { domainApi, Unit } from '@/services/domain-api'

const formSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(11, 'CPF deve ser válido'),
  unit: z.string().min(1, 'Unidade é obrigatória'),
  role: z.string().min(2, 'Cargo é obrigatório'),
})

export type ProfessionalFormValues = z.infer<typeof formSchema>

interface ProfessionalFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit' | 'view'
  professional?: Professional | null
  onSubmit: (data: ProfessionalFormValues) => void
}

export function ProfessionalFormDialog({
  open,
  onOpenChange,
  mode,
  professional,
  onSubmit,
}: ProfessionalFormDialogProps) {
  const [units, setUnits] = useState<Unit[]>([])

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      cpf: '',
      unit: '',
      role: '',
    },
  })

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const data = await domainApi.getUnits()
        // Filter only active units for new professionals, but keep logic simple for now as per requirements
        setUnits(data)
      } catch (error) {
        console.error('Failed to fetch units', error)
      }
    }
    fetchUnits()
  }, [])

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          name: '',
          cpf: '',
          unit: '',
          role: '',
        })
      } else if (professional) {
        form.reset({
          name: professional.name,
          cpf: professional.cpf,
          unit: professional.unit,
          role: professional.role,
        })
      }
    }
  }, [open, mode, professional, form])

  const handleSubmit = (data: ProfessionalFormValues) => {
    onSubmit(data)
    onOpenChange(false)
  }

  const isView = mode === 'view'
  const title =
    mode === 'add'
      ? 'Adicionar Profissional'
      : mode === 'edit'
        ? 'Editar Profissional'
        : 'Detalhes do Profissional'

  const description =
    mode === 'add'
      ? 'Preencha os dados do novo profissional. Clique em salvar para confirmar.'
      : mode === 'edit'
        ? 'Atualize os dados do profissional. Clique em salvar para confirmar.'
        : 'Visualize os dados cadastrais do profissional.'

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
                      <Input
                        placeholder="Nome completo"
                        disabled={isView}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">CPF</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        disabled={isView}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Unidade</FormLabel>
                  <div className="col-span-3">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                      disabled={isView}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
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
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4 space-y-0">
                  <FormLabel className="text-right">Cargo</FormLabel>
                  <div className="col-span-3">
                    <FormControl>
                      <Input
                        placeholder="Ex: Enfermeiro"
                        disabled={isView}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="mt-1" />
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              {!isView && (
                <Button type="submit">
                  {mode === 'add' ? 'Salvar Profissional' : 'Salvar Alterações'}
                </Button>
              )}
              {isView && (
                <Button type="button" onClick={() => onOpenChange(false)}>
                  Fechar
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
