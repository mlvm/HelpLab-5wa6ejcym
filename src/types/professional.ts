export type ProfessionalStatus = 'Ativo' | 'Inativo' | 'Bloqueado'

export interface Professional {
  id: number
  name: string
  cpf: string
  whatsapp?: string
  unit: string
  role: string
  status: ProfessionalStatus
}
