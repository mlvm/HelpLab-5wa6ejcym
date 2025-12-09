import { supabase } from '@/lib/supabase/client'

export interface Profile {
  id: string
  name: string
  cpf: string
  phone: string | null
  unit: string | null
  avatar_url: string | null
  status: 'active' | 'inactive'
  role: 'admin' | 'user'
  email?: string
}

export const profileService = {
  async getProfile(): Promise<Profile | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no authenticated user, return a mock profile
    if (!user) {
      return {
        id: 'guest-user-id',
        name: 'Visitante',
        cpf: '000.000.000-00',
        phone: '(00) 00000-0000',
        unit: 'Visitante',
        avatar_url: null,
        status: 'active',
        role: 'user',
        email: 'visitante@helplab.com.br',
      }
    }

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
      return { ...data, email: user.email } as Profile
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
      role: 'user',
      email: user.email,
    }
  },

  async updateProfile(profile: Partial<Profile>) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If guest, simulate success
    if (!user) {
      console.log('Profile update simulated for guest user:', profile)
      return
    }

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
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If guest, simulate success
    if (!user) {
      console.log('Password update simulated for guest user')
      return
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
  },

  async inactivateAccount() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If guest, just redirect to login
    if (!user) {
      window.location.href = '/login'
      return
    }

    const { error } = await supabase
      .from('profiles')
      .update({ status: 'inactive' })
      .eq('id', user.id)

    if (error) throw error

    await supabase.auth.signOut()
    window.location.href = '/login'
  },
}
