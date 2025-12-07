import { WhatsappMessage } from '@/pages/WhatsappPanel.data'

// Service simulating Supabase Edge Functions
// In a real scenario, this would use the supabase-js client:
// await supabase.functions.invoke('chatgpt-webhook', { body: { message } })

interface ChatGPTResponse {
  text: string
  action?: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
}

export const supabaseEdgeFunctions = {
  /**
   * Simulates invoking a Supabase Edge Function that connects to OpenAI's ChatGPT API.
   * This function acts as the intermediary described in the user story.
   */
  invokeChatGPT: async (
    content: string,
    context?: any,
  ): Promise<ChatGPTResponse> => {
    console.log('[Edge Function] Invoking chatgpt-webhook with:', content)

    // Simulate network latency for the Edge Function call
    const latency = 1500 + Math.random() * 1000
    await new Promise((resolve) => setTimeout(resolve, latency))

    // Mock Intelligence Logic (Simulating ChatGPT's response)
    // This replaces the old generateAIResponse with a "remote" execution simulation
    const lower = content.toLowerCase()

    let responseText = ''
    let action: string | undefined = undefined

    if (
      lower.includes('inscrever') ||
      lower.includes('curso') ||
      lower.includes('agendar')
    ) {
      responseText =
        'Olá! Sou o assistente virtual potencializado pelo ChatGPT. Percebi seu interesse em nossos treinamentos. Temos vagas abertas para "Biossegurança Avançada" e "Primeiros Socorros". Qual deles você gostaria de saber mais?'
      action = 'Listar treinamentos (GPT Decision)'
    } else if (lower.includes('cancelar') || lower.includes('desistir')) {
      responseText =
        'Compreendo. Para processar o cancelamento de forma segura, preciso validar sua identidade. Por favor, poderia confirmar os 3 primeiros dígitos do seu CPF?'
      action = 'Solicitar validação (GPT Decision)'
    } else if (lower.includes('certificado') || lower.includes('diploma')) {
      responseText =
        'Verifiquei em nossa base de conhecimento que os certificados são processados automaticamente 24 horas após a conclusão. Se já passou esse prazo, posso abrir um chamado para a secretaria. Deseja prosseguir?'
      action = 'Consultar política de certificados (GPT Decision)'
    } else if (
      lower.includes('preço') ||
      lower.includes('valor') ||
      lower.includes('custa')
    ) {
      responseText =
        'Nossos treinamentos para a rede pública são subsidiados. Para profissionais da rede privada, o investimento varia. Você possui vínculo com alguma unidade de saúde pública?'
      action = 'Qualificar lead (GPT Decision)'
    } else {
      responseText =
        'Olá! Sou a IA do HelpLab. Estou analisando sua mensagem com o ChatGPT para te ajudar da melhor forma. Você poderia me dar mais detalhes sobre o que precisa?'
      action = 'Saudação Genérica (GPT Decision)'
    }

    return {
      text: responseText,
      action: action,
      usage: {
        prompt_tokens: content.length / 4,
        completion_tokens: responseText.length / 4,
        total_tokens: (content.length + responseText.length) / 4,
      },
      model: 'gpt-4o-mini',
    }
  },
}
