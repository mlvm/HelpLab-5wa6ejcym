import { supabase } from '@/lib/supabase/client'
import { Professional, Appointment } from '@/types/db-types'
import { format } from 'date-fns'

// DatabaseService - Refactored for Supabase
// Maintaining backward compatibility where possible but making methods async

class DatabaseService {
  // Professionals
  async getProfessionals(): Promise<Professional[]> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*, unit:units(*)')
      .order('name')

    if (error) {
      console.error('Error fetching professionals:', error)
      return []
    }
    return data as Professional[]
  }

  async getProfessionalByCpf(cpf: string): Promise<Professional | null> {
    const { data, error } = await supabase
      .from('professionals')
      .select('*')
      .eq('cpf', cpf)
      .single()

    if (error) return null
    return data as Professional
  }

  async upsertProfessional(data: {
    name: string
    cpf: string
    whatsapp?: string
    unit_id?: string
    role: string
  }): Promise<Professional | null> {
    const existing = await this.getProfessionalByCpf(data.cpf)

    if (existing) {
      const { data: updated, error } = await supabase
        .from('professionals')
        .update({
          name: data.name,
          whatsapp: data.whatsapp,
          unit_id: data.unit_id,
          role: data.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error
      return updated
    } else {
      const { data: newProf, error } = await supabase
        .from('professionals')
        .insert({
          name: data.name,
          cpf: data.cpf,
          whatsapp: data.whatsapp,
          unit_id: data.unit_id,
          role: data.role,
        })
        .select()
        .single()

      if (error) throw error
      return newProf
    }
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from('appointments')
      .select(
        `
        *,
        professional:professionals(id, name, cpf, whatsapp, unit_id, role, status),
        training:trainings(id, name),
        history:appointment_history(*)
      `,
      )
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching appointments:', error)
      return []
    }

    // Map to ensure flat structure where needed or enrich
    return data.map((apt: any) => ({
      ...apt,
      prof: apt.professional?.name || 'Unknown', // Helper for UI
      training: apt.training?.name || apt.training_name, // Helper for UI
    })) as Appointment[]
  }

  async createAppointment(data: {
    professionalId: string
    training_id?: string
    training_name: string
    date: Date | string
    channel: string
    status: string
  }): Promise<Appointment | null> {
    let formattedDate = ''
    if (data.date instanceof Date) {
      formattedDate = format(data.date, 'yyyy-MM-dd')
    } else {
      formattedDate = data.date // Assuming YYYY-MM-DD or fix format
    }

    // Insert Appointment
    const { data: appt, error } = await supabase
      .from('appointments')
      .insert({
        professional_id: data.professionalId,
        training_id: data.training_id,
        training_name: data.training_name,
        date: formattedDate,
        channel: data.channel,
        status: data.status,
      })
      .select()
      .single()

    if (error) throw error

    // Insert History
    await supabase.from('appointment_history').insert({
      appointment_id: appt.id,
      status: data.status,
      updated_by: 'Sistema',
    })

    return appt
  }

  async updateAppointment(id: string, updates: Partial<Appointment>) {
    const { error } = await supabase
      .from('appointments')
      .update({
        status: updates.status,
        date: updates.date,
        channel: updates.channel,
        training_id: updates.training_id,
        training_name: updates.training_name,
      })
      .eq('id', id)

    if (error) throw error

    if (updates.status) {
      await supabase.from('appointment_history').insert({
        appointment_id: id,
        status: updates.status,
        updated_by: 'Admin', // Or get user context
      })
    }
  }

  async deleteAppointment(id: string) {
    const { error } = await supabase.from('appointments').delete().eq('id', id)

    if (error) throw error
  }
}

export const db = new DatabaseService()
