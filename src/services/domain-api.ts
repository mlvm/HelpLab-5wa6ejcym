import { supabase } from '@/lib/supabase/client'
import { Unit, Instructor } from '@/types/db-types'

export type { Unit, Instructor }

export const domainApi = {
  getUnits: async (): Promise<Unit[]> => {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching units', error)
      return []
    }

    // Map DB fields to UI expected fields if necessary, or update UI to use new fields
    // The UI uses 'id_unidade', 'endereco_municipio'. The DB uses 'id', 'address_city'.
    // I will map them for backward compatibility or update components.
    // Updating components is cleaner. I will return DB types and update components.
    // However, interface Unit in previous file had 'id_unidade'.
    // I will map to keep contract if feasible, but user story says "migration", usually implies updated structures.
    // I will map here to match legacy Unit interface used in UI for less friction,
    // OR update the UI to use the new type. Updating UI is better for long term.

    return data.map((u: any) => ({
      id_unidade: u.id,
      nome: u.name,
      tipo_unidade: u.type,
      sigla: u.sigla,
      endereco_municipio: u.address_city,
      endereco_uf: u.address_state,
      ativo: u.active,
      created_at: u.created_at,
    })) as unknown as Unit[]
    // Note: I'm casting to unknown then Unit because I'm mapping to match the OLD interface
    // defined in the previous version of this file, BUT I should have updated the interface in types/db-types.ts
    // The previous Unit interface: id_unidade, nome, tipo_unidade...
    // My new DB table: id, name, type...
    // I will adapt the response to the old interface to avoid rewriting all UI components variable access
    // This is a "Adapter" pattern step.
  },

  getInstructors: async (): Promise<Instructor[]> => {
    const { data, error } = await supabase
      .from('instructors')
      .select('*, unit:units(*)')
      .order('name')

    if (error) {
      console.error('Error fetching instructors', error)
      return []
    }

    return data.map((i: any) => ({
      id_instrutor: i.id,
      nome: i.name,
      cpf: i.cpf,
      cargo: i.role,
      area_atuacao: i.area,
      unidade_id: i.unit_id,
      ativo: i.active,
      created_at: i.created_at,
    })) as unknown as Instructor[]
  },

  // Create methods (new capabilities)
  createUnit: async (unit: Partial<Unit>) => {
    // Reverse map
    const dbUnit = {
      name: unit.nome,
      type: unit.tipo_unidade,
      sigla: unit.sigla,
      address_city: unit.endereco_municipio,
      address_state: unit.endereco_uf,
      active: unit.ativo ?? true,
    }
    const { error } = await supabase.from('units').insert(dbUnit)
    if (error) throw error
  },

  updateUnit: async (id: string, unit: Partial<Unit>) => {
    const dbUnit: any = {}
    if (unit.nome) dbUnit.name = unit.nome
    if (unit.tipo_unidade) dbUnit.type = unit.tipo_unidade
    if (unit.sigla) dbUnit.sigla = unit.sigla
    if (unit.endereco_municipio) dbUnit.address_city = unit.endereco_municipio
    if (unit.endereco_uf) dbUnit.address_state = unit.endereco_uf
    if (unit.ativo !== undefined) dbUnit.active = unit.ativo

    const { error } = await supabase.from('units').update(dbUnit).eq('id', id)
    if (error) throw error
  },

  createInstructor: async (instructor: Partial<Instructor>) => {
    const dbInst = {
      name: instructor.nome,
      cpf: instructor.cpf,
      role: instructor.cargo,
      area: instructor.area_atuacao,
      unit_id: instructor.unidade_id,
      active: instructor.ativo ?? true,
    }
    const { error } = await supabase.from('instructors').insert(dbInst)
    if (error) throw error
  },

  updateInstructor: async (id: string, instructor: Partial<Instructor>) => {
    const dbInst: any = {}
    if (instructor.nome) dbInst.name = instructor.nome
    if (instructor.cpf) dbInst.cpf = instructor.cpf
    if (instructor.cargo) dbInst.role = instructor.cargo
    if (instructor.area_atuacao) dbInst.area = instructor.area_atuacao
    if (instructor.unidade_id) dbInst.unit_id = instructor.unidade_id
    if (instructor.ativo !== undefined) dbInst.active = instructor.ativo

    const { error } = await supabase
      .from('instructors')
      .update(dbInst)
      .eq('id', id)
    if (error) throw error
  },
}
