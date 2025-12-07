export type ClassStatus = string

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
  maxParticipants?: number
}

export interface Student {
  id: number
  name: string
  cpf: string
  status: 'Confirmado' | 'Pendente'
  attendance: 'Presente' | 'Ausente' | 'Pendente'
}
