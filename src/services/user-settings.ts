import { supabase } from '@/lib/supabase/client'

export interface UserSettings {
  id: string
  user_id: string
  mega_api_instance_key: string | null
  mega_api_token: string | null
  created_at: string
  updated_at: string
}

export const userSettingsService = {
  async getSettings(): Promise<UserSettings | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user (guest mode), return null or default settings
    if (!user) return null

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      console.error('Error fetching settings:', error)
      return null
    }

    return data
  },

  async saveSettings(settings: {
    mega_api_instance_key: string
    mega_api_token: string
  }) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user (guest mode), allow simulation or return silently
    if (!user) {
      console.log('Settings save simulated for guest user:', settings)
      return
    }

    const existing = await this.getSettings()

    if (existing) {
      const { error } = await supabase
        .from('user_settings')
        .update({
          mega_api_instance_key: settings.mega_api_instance_key,
          mega_api_token: settings.mega_api_token,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
      if (error) throw error
    } else {
      const { error } = await supabase.from('user_settings').insert({
        user_id: user.id,
        mega_api_instance_key: settings.mega_api_instance_key,
        mega_api_token: settings.mega_api_token,
      })
      if (error) throw error
    }
  },
}
