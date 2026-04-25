const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export function requirePost(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method Not Allowed" });
    return false;
  }

  return true;
}

export function requireApiKey(res) {
  if (!process.env.GROQ_API_KEY) {
    res.status(503).json({
      message:
        "GROQ_API_KEY is not configured yet. Add it in Vercel or your local environment to enable live AI responses.",
    });
    return false;
  }

  return true;
}

export function hasValidImage(imageBase64) {
  return typeof imageBase64 === "string" && imageBase64.startsWith("data:image/");
}

export async function requestGroq(body) {
  const response = await fetch(GROQ_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Groq API Error:", data);
    const message =
      data?.error?.message || "Groq could not complete the request. Please try again.";
    throw new Error(message);
  }

  return data;
}

export function parseJsonContent(content) {
  try {
    return JSON.parse(content);
  } catch {
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error("Model response was not valid JSON.");
    }

    return JSON.parse(match[0]);
  }
}
