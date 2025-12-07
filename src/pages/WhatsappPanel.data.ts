export type WhatsappConversationStatus =
  | 'AGENDAMENTO_CONCLUIDO'
  | 'SEM_AGENDAMENTO'
  | 'ERRO_FLUXO'
  | 'OUTRO'

export interface WhatsappConversation {
  id: string
  profissionalNome?: string
  telefone: string
  ultimaMensagemPreview: string
  ultimaMensagemEm: string
  status: WhatsappConversationStatus
  origem: 'WHATSAPP'
}

export type ChatSender = 'USUARIO' | 'BOT'

export interface WhatsappMessage {
  id: string
  conversaId: string
  remetente: ChatSender
  conteudo: string
  criadoEm: string
  intencaoDetectada?: string
  acaoExecutadaPeloBot?: string
}

export type ProfissionalStatus = 'ATIVO' | 'INATIVO' | 'BLOQUEADO'

export interface Profissional {
  id: string
  nome: string
  cpf: string
  unidade: string
  cargo: string
  status: ProfissionalStatus
  avatarSeed?: string
}

export type AgendamentoStatus =
  | 'CONFIRMADO'
  | 'CANCELADO'
  | 'REAGENDADO'
  | 'FALTOSO'
  | 'CONCLUIDO'

export interface AgendamentoResumo {
  id: string
  conversaId: string
  treinamentoNome: string
  turmaDescricao: string
  status: AgendamentoStatus
  origem: 'WHATSAPP' | 'WEB'
}

// --- Mock Data ---

export const MOCK_CONVERSATIONS: WhatsappConversation[] = [
  {
    id: 'c1',
    profissionalNome: 'Ana Clara Souza',
    telefone: '+55 11 99999-0001',
    ultimaMensagemPreview: 'Obrigado, recebi a confirmação.',
    ultimaMensagemEm: '2024-10-15T10:30:00',
    status: 'AGENDAMENTO_CONCLUIDO',
    origem: 'WHATSAPP',
  },
  {
    id: 'c2',
    profissionalNome: 'Carlos Eduardo',
    telefone: '+55 11 98888-0002',
    ultimaMensagemPreview: 'Não estou conseguindo selecionar a data.',
    ultimaMensagemEm: '2024-10-15T09:15:00',
    status: 'ERRO_FLUXO',
    origem: 'WHATSAPP',
  },
  {
    id: 'c3',
    telefone: '+55 11 97777-0003',
    ultimaMensagemPreview: 'Quais são os cursos disponíveis?',
    ultimaMensagemEm: '2024-10-14T16:45:00',
    status: 'SEM_AGENDAMENTO',
    origem: 'WHATSAPP',
  },
  {
    id: 'c4',
    profissionalNome: 'Fernanda Lima',
    telefone: '+55 11 96666-0004',
    ultimaMensagemPreview: 'Vou verificar minha escala e retorno.',
    ultimaMensagemEm: '2024-10-14T14:20:00',
    status: 'OUTRO',
    origem: 'WHATSAPP',
  },
]

export const MOCK_MESSAGES: Record<string, WhatsappMessage[]> = {
  c1: [
    {
      id: 'm1',
      conversaId: 'c1',
      remetente: 'USUARIO',
      conteudo: 'Olá, gostaria de me inscrever no curso de Biossegurança.',
      criadoEm: '10:20',
      intencaoDetectada: 'Intenção: Inscrição em curso',
    },
    {
      id: 'm2',
      conversaId: 'c1',
      remetente: 'BOT',
      conteudo:
        'Olá Ana! Temos turmas disponíveis para Biossegurança nos dias 15/10 e 18/10. Qual prefere?',
      criadoEm: '10:20',
      acaoExecutadaPeloBot: 'Ação: Consultar turmas disponíveis',
    },
    {
      id: 'm3',
      conversaId: 'c1',
      remetente: 'USUARIO',
      conteudo: 'Prefiro dia 15/10.',
      criadoEm: '10:21',
      intencaoDetectada: 'Intenção: Selecionar data',
    },
    {
      id: 'm4',
      conversaId: 'c1',
      remetente: 'BOT',
      conteudo:
        'Perfeito. Sua inscrição para Biossegurança no dia 15/10 às 08:00 foi confirmada. Seu protocolo é #9988.',
      criadoEm: '10:21',
      acaoExecutadaPeloBot: 'Ação: Criar agendamento',
    },
    {
      id: 'm5',
      conversaId: 'c1',
      remetente: 'USUARIO',
      conteudo: 'Obrigado, recebi a confirmação.',
      criadoEm: '10:22',
      intencaoDetectada: 'Intenção: Agradecimento',
    },
  ],
  c2: [
    {
      id: 'm6',
      conversaId: 'c2',
      remetente: 'USUARIO',
      conteudo: 'Quero agendar Primeiros Socorros.',
      criadoEm: '09:10',
      intencaoDetectada: 'Intenção: Inscrição em curso',
    },
    {
      id: 'm7',
      conversaId: 'c2',
      remetente: 'BOT',
      conteudo: 'Por favor, informe seu CPF para continuarmos.',
      criadoEm: '09:10',
      acaoExecutadaPeloBot: 'Ação: Solicitar identificação',
    },
    {
      id: 'm8',
      conversaId: 'c2',
      remetente: 'USUARIO',
      conteudo: 'Não estou conseguindo selecionar a data.',
      criadoEm: '09:15',
      intencaoDetectada: 'Intenção: Relato de erro',
    },
  ],
  c3: [
    {
      id: 'm9',
      conversaId: 'c3',
      remetente: 'USUARIO',
      conteudo: 'Olá',
      criadoEm: '16:40',
    },
    {
      id: 'm10',
      conversaId: 'c3',
      remetente: 'BOT',
      conteudo:
        'Olá! Sou o assistente virtual do HelpLab. Como posso ajudar você hoje?',
      criadoEm: '16:40',
      acaoExecutadaPeloBot: 'Ação: Saudação inicial',
    },
    {
      id: 'm11',
      conversaId: 'c3',
      remetente: 'USUARIO',
      conteudo: 'Quais são os cursos disponíveis?',
      criadoEm: '16:45',
      intencaoDetectada: 'Intenção: Listar cursos',
    },
  ],
}

export const MOCK_PROFESSIONALS: Record<string, Profissional> = {
  c1: {
    id: 'p1',
    nome: 'Ana Clara Souza',
    cpf: '123.***.***-00',
    unidade: 'Hospital Geral',
    cargo: 'Enfermeira',
    status: 'ATIVO',
    avatarSeed: '1',
  },
  c2: {
    id: 'p2',
    nome: 'Carlos Eduardo',
    cpf: '987.***.***-11',
    unidade: 'UBS Centro',
    cargo: 'Técnico',
    status: 'ATIVO',
    avatarSeed: '2',
  },
  c4: {
    id: 'p4',
    nome: 'Fernanda Lima',
    cpf: '456.***.***-22',
    unidade: 'LACEN',
    cargo: 'Biomédica',
    status: 'INATIVO',
    avatarSeed: '4',
  },
}

export const MOCK_APPOINTMENTS: AgendamentoResumo[] = [
  {
    id: 'a1',
    conversaId: 'c1',
    treinamentoNome: 'Biossegurança Básica',
    turmaDescricao: '15/10 às 08:00',
    status: 'CONFIRMADO',
    origem: 'WHATSAPP',
  },
  {
    id: 'a2',
    conversaId: 'c1',
    treinamentoNome: 'Primeiros Socorros',
    turmaDescricao: '20/09 às 14:00',
    status: 'CONCLUIDO',
    origem: 'WEB',
  },
  {
    id: 'a3',
    conversaId: 'c2',
    treinamentoNome: 'Gestão Laboratorial',
    turmaDescricao: '10/10 às 09:00',
    status: 'CANCELADO',
    origem: 'WHATSAPP',
  },
]
