export type TrainingStatus = 'Ativo' | 'Inativo'

export interface Training {
  id: number
  name: string
  hours: string
  capacity: number
  status: TrainingStatus
  description?: string
}
