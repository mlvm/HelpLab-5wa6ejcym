export interface Unit {
  id_unidade: string
  nome: string
}

export interface Instructor {
  id_instrutor: string
  nome: string
}

const MOCK_UNITS: Unit[] = [
  { id_unidade: '1', nome: 'LACEN' },
  { id_unidade: '2', nome: 'Hospital Geral' },
  { id_unidade: '3', nome: 'UBS Centro' },
  { id_unidade: '4', nome: 'Hospital Infantil' },
  { id_unidade: '5', nome: 'UBS Norte' },
]

const MOCK_INSTRUCTORS: Instructor[] = [
  { id_instrutor: '1', nome: 'Dr. Silva' },
  { id_instrutor: '2', nome: 'Enf. Maria' },
  { id_instrutor: '3', nome: 'Adm. Roberto' },
  { id_instrutor: '4', nome: 'Bio. Carla' },
]

export const domainApi = {
  getUnits: async (): Promise<Unit[]> => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_UNITS), 300)
    })
  },
  getInstructors: async (): Promise<Instructor[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_INSTRUCTORS), 300)
    })
  },
}
