import { format } from 'date-fns'

export interface Professional {
  id: string
  name: string
  cpf: string
  unit: string
  role: string
  createdAt: string
  updatedAt: string
}

export interface Appointment {
  id: number
  professionalId: string
  prof: string // Denormalized name
  training: string
  date: string
  channel: string
  status: string
  createdAt: string
}

class DatabaseService {
  private professionals: Professional[] = []
  private appointments: Appointment[] = []

  constructor() {
    this.load()
    if (this.appointments.length === 0) {
      this.seed()
    }
  }

  private load() {
    try {
      const storedProfs = localStorage.getItem('helplab_professionals')
      const storedAppts = localStorage.getItem('helplab_appointments')
      if (storedProfs) this.professionals = JSON.parse(storedProfs)
      if (storedAppts) this.appointments = JSON.parse(storedAppts)
    } catch (e) {
      console.error('Failed to load database', e)
    }
  }

  private save() {
    try {
      localStorage.setItem(
        'helplab_professionals',
        JSON.stringify(this.professionals),
      )
      localStorage.setItem(
        'helplab_appointments',
        JSON.stringify(this.appointments),
      )
    } catch (e) {
      console.error('Failed to save database', e)
    }
  }

  private seed() {
    // Initial Seed Data
    const profs: Professional[] = [
      {
        id: 'p1',
        name: 'Ana Clara',
        cpf: '123.456.789-00',
        unit: 'Hospital Central',
        role: 'Enfermeira',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'p2',
        name: 'Carlos Eduardo',
        cpf: '987.654.321-11',
        unit: 'UBS Centro',
        role: 'Técnico',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]

    const appts: Appointment[] = [
      {
        id: 1,
        professionalId: 'p1',
        prof: 'Ana Clara',
        training: 'Biossegurança',
        date: '15/10/2024',
        channel: 'WhatsApp',
        status: 'Confirmado',
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        professionalId: 'p2',
        prof: 'Carlos Eduardo',
        training: 'Biossegurança',
        date: '15/10/2024',
        channel: 'WhatsApp',
        status: 'Confirmado',
        createdAt: new Date().toISOString(),
      },
    ]

    this.professionals = profs
    this.appointments = appts
    this.save()
  }

  // --- Public API ---

  getProfessionals() {
    return [...this.professionals]
  }

  getAppointments() {
    return [...this.appointments]
  }

  getProfessionalByCpf(cpf: string) {
    return this.professionals.find((p) => p.cpf === cpf)
  }

  upsertProfessional(data: {
    name: string
    cpf: string
    unit: string
    role: string
  }): Professional {
    const existing = this.getProfessionalByCpf(data.cpf)
    const now = new Date().toISOString()

    if (existing) {
      // Update
      const updated = {
        ...existing,
        name: data.name,
        unit: data.unit,
        role: data.role,
        updatedAt: now,
      }
      this.professionals = this.professionals.map((p) =>
        p.id === existing.id ? updated : p,
      )
      this.save()
      return updated
    } else {
      // Create
      const newItem: Professional = {
        id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: data.name,
        cpf: data.cpf,
        unit: data.unit,
        role: data.role,
        createdAt: now,
        updatedAt: now,
      }
      this.professionals = [...this.professionals, newItem]
      this.save()
      return newItem
    }
  }

  createAppointment(data: {
    professionalId: string
    profName: string
    training: string
    date: Date | string
    channel: string
    status: string
  }): Appointment {
    let formattedDate = ''
    if (data.date instanceof Date) {
      formattedDate = format(data.date, 'dd/MM/yyyy')
    } else {
      formattedDate = data.date
    }

    const newId = Math.max(0, ...this.appointments.map((a) => a.id)) + 1
    const newAppt: Appointment = {
      id: newId,
      professionalId: data.professionalId,
      prof: data.profName,
      training: data.training,
      date: formattedDate,
      channel: data.channel,
      status: data.status,
      createdAt: new Date().toISOString(),
    }

    this.appointments = [newAppt, ...this.appointments]
    this.save()
    return newAppt
  }

  updateAppointment(id: number, updates: Partial<Appointment>) {
    this.appointments = this.appointments.map((a) =>
      a.id === id ? { ...a, ...updates } : a,
    )
    this.save()
  }

  deleteAppointment(id: number) {
    this.appointments = this.appointments.filter((a) => a.id !== id)
    this.save()
  }
}

export const db = new DatabaseService()
