export const GROQ_CHAT_COMPLETIONS_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Central Groq integration point. Add GROQ_API_KEY in the environment;
// do not place secrets in client-side code or committed files.
export function hasGroqKey() {
  return Boolean(process.env.GROQ_API_KEY);
}

export async function groqChatCompletion(payload) {
  if (!hasGroqKey()) {
    const error = new Error('GROQ_API_KEY is not configured.');
    error.code = 'MISSING_GROQ_API_KEY';
    throw error;
  }

  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data?.error?.message || 'Groq request failed.');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function extractJsonObject(text) {
  if (!text || typeof text !== 'string') return null;
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}
