import { z } from 'zod'

export interface Unit {
  id_unidade: string
  nome: string
  tipo_unidade: string
  sigla?: string
  cnes?: string
  cnpj?: string
  telefone?: string
  email_contato?: string
  endereco_logradouro?: string
  endereco_numero?: string
  endereco_bairro?: string
  endereco_municipio?: string
  endereco_uf?: string
  cep?: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

export interface Instructor {
  id_instrutor: string
  nome: string
  cpf?: string
  email?: string
  telefone?: string
  cargo?: string
  vinculo?: string
  area_atuacao?: string
  unidade_id: string
  ativo: boolean
  created_at?: string
  updated_at?: string
}

const MOCK_UNITS: Unit[] = [
  {
    id_unidade: '1',
    nome: 'LACEN',
    tipo_unidade: 'Laboratório',
    sigla: 'LACEN-ES',
    cnes: '1234567',
    ativo: true,
    endereco_municipio: 'Vitória',
    endereco_uf: 'ES',
  },
  {
    id_unidade: '2',
    nome: 'Hospital Geral',
    tipo_unidade: 'Hospital',
    sigla: 'HGE',
    cnes: '7654321',
    ativo: true,
    endereco_municipio: 'Serra',
    endereco_uf: 'ES',
  },
  {
    id_unidade: '3',
    nome: 'UBS Centro',
    tipo_unidade: 'UBS',
    ativo: true,
    endereco_municipio: 'Vila Velha',
    endereco_uf: 'ES',
  },
  {
    id_unidade: '4',
    nome: 'Hospital Infantil',
    tipo_unidade: 'Hospital',
    ativo: true,
    endereco_municipio: 'Vitória',
    endereco_uf: 'ES',
  },
  {
    id_unidade: '5',
    nome: 'UBS Norte',
    tipo_unidade: 'UBS',
    ativo: true,
    endereco_municipio: 'Linhares',
    endereco_uf: 'ES',
  },
]

const MOCK_INSTRUCTORS: Instructor[] = [
  {
    id_instrutor: '1',
    nome: 'Dr. Silva',
    cpf: '111.222.333-44',
    cargo: 'Médico Infectologista',
    unidade_id: '1',
    ativo: true,
    area_atuacao: 'Infectologia',
  },
  {
    id_instrutor: '2',
    nome: 'Enf. Maria',
    cpf: '555.666.777-88',
    cargo: 'Enfermeira Chefe',
    unidade_id: '2',
    ativo: true,
    area_atuacao: 'Enfermagem',
  },
  {
    id_instrutor: '3',
    nome: 'Adm. Roberto',
    cpf: '999.888.777-66',
    cargo: 'Administrador Hospitalar',
    unidade_id: '4',
    ativo: true,
    area_atuacao: 'Gestão',
  },
  {
    id_instrutor: '4',
    nome: 'Bio. Carla',
    cpf: '222.333.444-55',
    cargo: 'Biomédica',
    unidade_id: '1',
    ativo: true,
    area_atuacao: 'Análises Clínicas',
  },
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
