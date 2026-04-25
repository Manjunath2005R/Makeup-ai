import {
  hasValidImage,
  parseJsonContent,
  requestGroq,
  requireApiKey,
  requirePost,
} from "./_lib/groq.js";

const SYSTEM_PROMPT = `You are a luxury beauty analyst writing a positive, respectful beauty reflection for Spoorthi.

You must analyze the uploaded portrait and respond with JSON only.

Rules:
1. Keep the tone warm, elegant, affirming, and emotionally meaningful.
2. Never insult, shame, sexualize, or compare negatively.
3. Compliments must mention visible presentation details such as smile, eyes, poise, glow, expression, styling, softness, confidence, or lighting.
4. Skin care suggestions must be gentle, practical, non-medical, and framed as supportive maintenance ideas.
5. The comparison style line must be classy and uplifting, never ranking the person against others.
6. Return JSON with this exact shape:
{
  "title": "string",
  "score": 0,
  "summary": "string",
  "compliments": ["string", "string", "string", "string"],
  "skincareTips": ["string", "string", "string", "string"],
  "comparisonStyle": "string"
}`;

function sanitizeText(value, fallback) {
  const text = String(value || "").trim();
  return text || fallback;
}

function sanitizeArray(values, fallbackItems) {
  const items = Array.isArray(values) ? values : fallbackItems;
  return items.map((item) => sanitizeText(item, "")).filter(Boolean).slice(0, 6);
}

export default async function handler(req, res) {
  if (!requirePost(req, res) || !requireApiKey(res)) {
    return;
  }

  const { imageBase64 } = req.body || {};

  if (!hasValidImage(imageBase64)) {
    return res.status(400).json({ message: "Please upload a valid image to analyze." });
  }

  try {
    const data = await requestGroq({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: SYSTEM_PROMPT },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      temperature: 0.8,
      top_p: 0.95,
      max_tokens: 900,
      response_format: { type: "json_object" },
    });

    const parsed = parseJsonContent(data.choices?.[0]?.message?.content || "");

    res.status(200).json({
      title: sanitizeText(parsed.title, "Spoorthi's radiant beauty reflection"),
      score: Math.max(72, Math.min(100, Number(parsed.score) || 92)),
      summary: sanitizeText(
        parsed.summary,
        "A graceful portrait with warmth, confidence, and polished natural beauty."
      ),
      compliments: sanitizeArray(parsed.compliments, [
        "Your smile carries elegance.",
        "Your eyes reflect confidence and warmth.",
        "Natural beauty like yours is rare.",
        "Grace and beauty shine effortlessly.",
      ]),
      skincareTips: sanitizeArray(parsed.skincareTips, [
        "Keep hydration consistent to preserve a soft, fresh glow.",
        "Use a gentle cleanser and barrier-friendly moisturizer morning and night.",
        "Daily sunscreen helps maintain brightness and even-looking skin.",
        "A simple weekly nourishing mask can support smooth, healthy radiance.",
      ]),
      comparisonStyle: sanitizeText(
        parsed.comparisonStyle,
        "Radiance comparable to timeless elegance."
      ),
    });
  } catch (error) {
    console.error("Analyze API Error:", error);
    res.status(500).json({
      message: "The beauty analysis could not be completed right now. Please try again shortly.",
    });
  }
}
