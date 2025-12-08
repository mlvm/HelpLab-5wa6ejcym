import { supabase } from '@/lib/supabase/client'
import { AuditLog } from '@/types/db-types'

export const auditService = {
  getLogs: async (): Promise<AuditLog[]> => {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error fetching audit logs:', error)
      return []
    }

    return data as AuditLog[]
  },

  log: async (action: string, entity: string, details: string) => {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { error } = await supabase.from('audit_logs').insert({
      user_id: user?.id,
      action,
      entity,
      details,
    })

    if (error) console.error('Failed to write audit log', error)
  },
}
