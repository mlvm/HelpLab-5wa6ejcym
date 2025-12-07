// Service simulating Supabase Edge Functions
// In a real scenario, this would use the supabase-js client:
// await supabase.functions.invoke('ai-webhook', { body: { message, provider, model } })

export interface AIResponse {
  text: string
  action?: string
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  provider: string
  latency: number
}

export const supabaseEdgeFunctions = {
  /**
   * Simulates invoking a Supabase Edge Function that connects to OpenAI or Gemini API.
   */
  invokeAI: async (
    content: string,
    provider: 'chatgpt' | 'gemini',
    model: string,
    systemPrompt?: string,
    context?: any,
  ): Promise<AIResponse> => {
    console.log(
      `[Edge Function] Invoking ai-webhook with provider: ${provider}, model: ${model}`,
    )

    const startTime = Date.now()

    // Simulate network latency for the Edge Function call
    const latency = 1500 + Math.random() * 1000
    await new Promise((resolve) => setTimeout(resolve, latency))

    // Mock Intelligence Logic
    const lower = content.toLowerCase()

    let responseText = ''
    let action: string | undefined = undefined

    // Simulate stylistic differences between providers
    const prefix = provider === 'gemini' ? '✨ [Gemini] ' : ''

    if (systemPrompt && systemPrompt.trim().length > 0) {
      // In a real scenario, the system prompt guides the behavior.
      // We mock this by "acknowledging" the instruction if debugging.
      // For user story, we assume it silently guides the AI.
      console.log('[Edge Function] Using System Prompt:', systemPrompt)
    }

    if (
      lower.includes('inscrever') ||
      lower.includes('curso') ||
      lower.includes('agendar')
    ) {
      responseText = `${prefix}Olá! Percebi seu interesse em nossos treinamentos. Temos vagas para "Biossegurança Avançada" e "Primeiros Socorros". Posso te dar mais detalhes?`
      action = 'Listar treinamentos'
    } else if (lower.includes('cancelar') || lower.includes('desistir')) {
      responseText = `${prefix}Entendo. Para cancelar com segurança, preciso validar sua identidade. Por favor, informe os 3 primeiros dígitos do CPF.`
      action = 'Solicitar validação'
    } else if (lower.includes('certificado') || lower.includes('diploma')) {
      responseText = `${prefix}Os certificados são emitidos automaticamente em até 24 horas após o curso. Se houve atraso, posso abrir um chamado.`
      action = 'Consultar política de certificados'
    } else if (
      lower.includes('preço') ||
      lower.includes('valor') ||
      lower.includes('custa')
    ) {
      responseText = `${prefix}Nossos treinamentos são subsidiados para a rede pública. Você possui vínculo com alguma unidade do SUS?`
      action = 'Qualificar lead'
    } else if (
      lower.includes('teste') ||
      lower.includes('test') ||
      lower.includes('ping')
    ) {
      responseText = `${prefix}Teste de conectividade bem-sucedido. Modelo ${model} operando normalmente.`
      action = 'Teste de Conectividade'
    } else {
      responseText = `${prefix}Olá! Sou a IA do HelpLab. Como posso auxiliar você hoje com os treinamentos?`
      action = 'Saudação Genérica'
    }

    const actualLatency = Date.now() - startTime

    return {
      text: responseText,
      action: action,
      usage: {
        prompt_tokens: Math.ceil(
          content.length / 4 + (systemPrompt?.length || 0) / 4,
        ),
        completion_tokens: Math.ceil(responseText.length / 4),
        total_tokens: Math.ceil(
          (content.length + responseText.length + (systemPrompt?.length || 0)) /
            4,
        ),
      },
      model: model,
      provider: provider,
      latency: actualLatency,
    }
  },
}
