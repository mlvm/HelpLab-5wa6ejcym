import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { ClassStatus } from '@/types/class-status'

interface ClassStatusContextType {
  statuses: ClassStatus[]
  addStatus: (status: Omit<ClassStatus, 'id'>) => void
  updateStatus: (id: string, status: Partial<ClassStatus>) => void
  deleteStatus: (id: string) => void
  getStatusByName: (name: string) => ClassStatus | undefined
  getStatusColor: (name: string) => string
}

const ClassStatusContext = createContext<ClassStatusContextType | undefined>(
  undefined,
)

const DEFAULT_STATUSES: ClassStatus[] = [
  { id: 'planned', name: 'Planejada', color: '#64748b', isDefault: true },
  { id: 'open', name: 'Aberta', color: '#22c55e', isDefault: true },
  { id: 'full', name: 'Lotada', color: '#ef4444', isDefault: true },
  { id: 'cancelled', name: 'Cancelada', color: '#94a3b8', isDefault: true },
  { id: 'completed', name: 'Concluída', color: '#3b82f6', isDefault: true },
]

export function ClassStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<ClassStatus[]>(() => {
    const stored = localStorage.getItem('class-statuses')
    return stored ? JSON.parse(stored) : DEFAULT_STATUSES
  })

  useEffect(() => {
    localStorage.setItem('class-statuses', JSON.stringify(statuses))
  }, [statuses])

  const addStatus = (newStatus: Omit<ClassStatus, 'id'>) => {
    const status: ClassStatus = {
      ...newStatus,
      id: Math.random().toString(36).substr(2, 9),
    }
    setStatuses((prev) => [...prev, status])
  }

  const updateStatus = (id: string, updated: Partial<ClassStatus>) => {
    setStatuses((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s)),
    )
  }

  const deleteStatus = (id: string) => {
    setStatuses((prev) => prev.filter((s) => s.id !== id))
  }

  const getStatusByName = (name: string) => {
    return statuses.find(
      (s) => s.name.toLowerCase() === name.toLowerCase() || s.id === name,
    )
  }

  const getStatusColor = (name: string) => {
    const status = statuses.find(
      (s) => s.name.toLowerCase() === name.toLowerCase(),
    )
    return status ? status.color : '#64748b' // Default gray
  }

  return (
    <ClassStatusContext.Provider
      value={{
        statuses,
        addStatus,
        updateStatus,
        deleteStatus,
        getStatusByName,
        getStatusColor,
      }}
    >
      {children}
    </ClassStatusContext.Provider>
  )
}

export function useClassStatus() {
  const context = useContext(ClassStatusContext)
  if (context === undefined) {
    throw new Error('useClassStatus must be used within a ClassStatusProvider')
  }
  return context
}
