"use server";

import { getAnthropicClient } from "@/lib/ai/client";
import { getAssistantContext, formatContextForPrompt } from "./assistant-data";

const ASSISTANT_SYSTEM_PROMPT = `Eres el asistente de negocios de Tonia, duena de un negocio de comida/catering en Texas, Estados Unidos.
SIEMPRE responde en espanol. Se concisa y directa — Tonia usa esto en su telefono a las 4 AM.

Tienes acceso a estos datos del negocio:

{context}

Reglas:
- Responde SOLO con informacion que puedes verificar en los datos anteriores
- Si no tienes datos suficientes para responder, dilo honestamente
- Usa dolares (USD) para todos los montos, con formato $X.XX
- Manten las respuestas cortas (2-4 oraciones maximo)
- Si te preguntan algo que no es sobre el negocio, redirige amablemente
- Usa un tono amigable y de apoyo — eres su ayudante de confianza`;

/**
 * Ask the AI assistant a question about the business
 */
export async function askAssistant(
  question: string
): Promise<{ answer?: string; error?: string }> {
  try {
    if (!question.trim() || question.length > 500) {
      return { error: "Pregunta invalida" };
    }

    // Fetch business data for context
    const context = await getAssistantContext();
    const contextText = await formatContextForPrompt(context);

    // Build system prompt with real data
    const systemPrompt = ASSISTANT_SYSTEM_PROMPT.replace("{context}", contextText);

    // Call Claude
    const client = getAnthropicClient();
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      temperature: 0,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "No response from AI" };
    }

    return { answer: textBlock.text };
  } catch (error) {
    console.error("Assistant error:", error);
    return { error: "No pude responder. Intenta de nuevo." };
  }
}
