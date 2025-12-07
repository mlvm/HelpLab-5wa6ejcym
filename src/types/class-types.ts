export type ClassStatus =
  | 'Planejada'
  | 'Aberta'
  | 'Lotada'
  | 'Cancelada'
  | 'Concluída'

export interface ClassItem {
  id: number
  title: string
  date: string
  time: string
  status: ClassStatus
  instructor: string
  location?: string
  capacity?: number
  enrolled?: number
}

export interface Student {
  id: number
  name: string
  cpf: string
  status: 'Confirmado' | 'Pendente'
  present: boolean
}
