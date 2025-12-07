// Service simulating Supabase Edge Functions
// In a real scenario, this would use the supabase-js client:
// await supabase.functions.invoke('ai-webhook', { body: { message, provider, model } })

export interface ExtractedData {
  professional: {
    name: string
    cpf: string
    unit: string
    role: string
  }
  appointment: {
    training: string
    date: string
  }
}

export interface AIResponse {
  text: string
  action?: string
  extracted_data?: ExtractedData
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
    let extractedData: ExtractedData | undefined = undefined

    // Simulate stylistic differences between providers
    const prefix = provider === 'gemini' ? '✨ [Gemini] ' : ''

    // Mock extraction logic for the user story
    // Trigger pattern: "agendar" + "cpf" + "para" (simple heuristic for demo)
    if (lower.includes('agendar') && lower.includes('cpf')) {
      // Try to "extract" data from a simulated formatted string
      // Format expected for test: "Agendar [Training] para [Name], CPF [CPF], [Role] em [Unit] no dia [Date]"
      // Regex is too complex for this simple mock, we'll just check keywords and return mock data if it looks like a registration request

      // MOCK EXTRACTION based on content analysis
      // In real life, an LLM extracts this JSON.

      // Fallback extraction data for testing
      extractedData = {
        professional: {
          name: 'João da Silva',
          cpf: '123.123.123-12',
          unit: 'Hospital Regional',
          role: 'Enfermeiro',
        },
        appointment: {
          training: 'Biossegurança',
          date: '20/10/2024',
        },
      }

      // If the message contains specific data overrides for demo
      const cpfMatch = content.match(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
      if (cpfMatch) extractedData.professional.cpf = cpfMatch[0]

      // Simple name extraction heuristic (very naive)
      if (content.includes('para ')) {
        const afterPara = content.split('para ')[1].split(',')[0]
        if (afterPara) extractedData.professional.name = afterPara.trim()
      }

      responseText = `${prefix}Recebi os dados. Processando agendamento para ${extractedData.professional.name}...`
      action = 'Processar Agendamento Automático'
    } else if (
      lower.includes('inscrever') ||
      lower.includes('curso') ||
      lower.includes('agendar')
    ) {
      responseText = `${prefix}Olá! Para agendar, por favor envie: "Agendar [Treinamento] para [Nome], CPF [CPF], [Cargo] em [Unidade] no dia [Data]".`
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
      extracted_data: extractedData,
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
