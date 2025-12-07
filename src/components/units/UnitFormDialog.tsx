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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Unit } from '@/services/domain-api'

const formSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tipo_unidade: z.string().min(1, 'Tipo é obrigatório'),
  sigla: z.string().optional(),
  endereco_municipio: z.string().optional(),
  endereco_uf: z.string().max(2, 'UF deve ter 2 caracteres').optional(),
})

export type UnitFormValues = z.infer<typeof formSchema>

interface UnitFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  unit?: Unit | null
  onSubmit: (data: UnitFormValues) => void
}

export function UnitFormDialog({
  open,
  onOpenChange,
  mode,
  unit,
  onSubmit,
}: UnitFormDialogProps) {
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: '',
      tipo_unidade: '',
      sigla: '',
      endereco_municipio: '',
      endereco_uf: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (mode === 'add') {
        form.reset({
          nome: '',
          tipo_unidade: '',
          sigla: '',
          endereco_municipio: '',
          endereco_uf: '',
        })
      } else if (unit) {
        form.reset({
          nome: unit.nome,
          tipo_unidade: unit.tipo_unidade,
          sigla: unit.sigla || '',
          endereco_municipio: unit.endereco_municipio || '',
          endereco_uf: unit.endereco_uf || '',
        })
      }
    }
  }, [open, mode, unit, form])

  const handleSubmit = (data: UnitFormValues) => {
    onSubmit(data)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Nova Unidade' : 'Editar Unidade'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Cadastre uma nova unidade de saúde.'
              : 'Atualize os dados da unidade.'}
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
                  <FormLabel>Nome da Unidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Hospital Central" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_unidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
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
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Laboratório">Laboratório</SelectItem>
                        <SelectItem value="UBS">UBS</SelectItem>
                        <SelectItem value="Clínica">Clínica</SelectItem>
                        <SelectItem value="Secretaria">Secretaria</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sigla"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sigla</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: HGE" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco_municipio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Vitória" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endereco_uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <FormControl>
                      <Input placeholder="ES" maxLength={2} {...field} />
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
