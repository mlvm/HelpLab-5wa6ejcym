import { supabase } from '@/lib/supabase/client'
import { User, CreateUserDTO, UpdateUserDTO } from '@/types/user'

export const adminService = {
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.functions.invoke('manage-users', {
      method: 'GET',
    })
    if (error) throw error
    return data
  },

  async createUser(user: CreateUserDTO): Promise<void> {
    const { error } = await supabase.functions.invoke('manage-users', {
      method: 'POST',
      body: { action: 'create', ...user },
    })
    if (error) throw error
  },

  async updateUser(user: UpdateUserDTO): Promise<void> {
    const { error } = await supabase.functions.invoke('manage-users', {
      method: 'POST',
      body: { action: 'update', ...user },
    })
    if (error) throw error
  },

  async deactivateUser(id: string): Promise<void> {
    const { error } = await supabase.functions.invoke('manage-users', {
      method: 'POST',
      body: { action: 'deactivate', id },
    })
    if (error) throw error
  },

  async changePassword(id: string, password: string): Promise<void> {
    const { error } = await supabase.functions.invoke('manage-users', {
      method: 'POST',
      body: { action: 'changePassword', id, password },
    })
    if (error) throw error
  },
}
