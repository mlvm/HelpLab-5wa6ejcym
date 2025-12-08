export type UserStatus = 'active' | 'inactive'
export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  email: string
  name: string
  cpf: string
  phone?: string
  unit?: string
  status: UserStatus
  role: UserRole
  avatar_url?: string
}

export interface CreateUserDTO {
  email: string
  password?: string // Required for create
  name: string
  cpf: string
  phone?: string
  unit?: string
  status: UserStatus
  role?: UserRole
}

export interface UpdateUserDTO extends Partial<CreateUserDTO> {
  id: string
}
