export interface Unit {
  id: string
  name: string
  type: string
  sigla?: string
  address_city?: string
  address_state?: string
  active: boolean
  created_at: string
}

export interface Professional {
  id: string
  name: string
  cpf: string
  whatsapp?: string
  unit_id?: string
  unit?: Unit
  role: string
  status: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Instructor {
  id: string
  name: string
  cpf?: string
  unit_id?: string
  unit?: Unit
  role?: string
  area?: string
  active: boolean
  created_at: string
}

export interface Training {
  id: string
  name: string
  hours: string
  capacity: number
  status: string
  instructor_id?: string
  instructor?: Instructor
  description?: string
  material_url?: string
  created_at: string
}

export interface AppointmentHistory {
  id: string
  appointment_id: string
  status: string
  updated_by: string
  created_at: string
}

export interface Appointment {
  id: string
  professional_id: string
  professional?: Professional
  training_id?: string
  training?: Training
  training_name: string
  date: string
  channel: string
  status: string
  created_at: string
  history?: AppointmentHistory[]
}

export interface Communication {
  id: string
  recipient_name: string
  recipient_contact: string
  channel: string
  content: string
  status: string
  sent_at: string
  metadata?: any
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  entity: string
  details: string
  created_at: string
}
