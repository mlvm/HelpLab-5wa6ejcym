import { supabase } from '@/lib/supabase/client'

export const storageService = {
  /**
   * Uploads a file to a specific bucket.
   * @param bucket 'avatars' or 'materials'
   * @param path The file path (e.g., 'user-id/avatar.png')
   * @param file The file object
   */
  async uploadFile(bucket: 'avatars' | 'materials', path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
        cacheControl: '3600',
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw error
    }

    return data
  },

  /**
   * Gets the public URL for a file.
   */
  getPublicUrl(bucket: 'avatars' | 'materials', path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  /**
   * Helper to upload avatar for a user/professional
   */
  async uploadAvatar(id: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${id}/avatar.${fileExt}`

    await this.uploadFile('avatars', filePath, file)
    return this.getPublicUrl('avatars', filePath)
  },

  /**
   * Helper to upload training material
   */
  async uploadMaterial(trainingId: string, file: File) {
    const fileExt = file.name.split('.').pop()
    const filePath = `${trainingId}/${file.name}` // Keep original name for download clarity

    await this.uploadFile('materials', filePath, file)
    return this.getPublicUrl('materials', filePath)
  },
}
