import { supabase } from '@/lib/supabase/client'

export interface Profile {
  id: string
  name: string
  cpf: string
  phone: string | null
  unit: string | null
  avatar_url: string | null
  status: 'active' | 'inactive'
  email?: string
}

export const profileService = {
  async getProfile(): Promise<Profile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error)
      return null
    }

    if (data) {
      return { ...data, email: user.email }
    }

    // Return basic info from auth to pre-fill if no profile exists
    return {
      id: user.id,
      name: user.user_metadata?.name || '',
      cpf: user.user_metadata?.cpf || '',
      phone: '',
      unit: '',
      avatar_url: null,
      status: 'active',
      email: user.email,
    }
  },

  async updateProfile(profile: Partial<Profile>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const profileData = {
      id: user.id,
      name: profile.name,
      cpf: profile.cpf,
      phone: profile.phone,
      unit: profile.unit,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(profileData)

    if (error) throw error
  },

  async updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  async inactivateAccount() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado')

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', user.id)

    if (error) throw error

    await supabase.auth.signOut()
    window.location.href = '/login'
  },
}
