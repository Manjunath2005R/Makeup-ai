import { extractJsonObject, groqChatCompletion, hasGroqKey } from '../../lib/groq';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb'
    }
  }
};

const previewAnalysis = {
  beautyScore: 94,
  summary: 'Spoorthi, your presence carries a quiet radiance that feels warm, graceful, and unforgettable.',
  compliments: [
    'Your smile carries elegance and emotional warmth.',
    'Your eyes reflect confidence, kindness, and calm strength.',
    'Natural beauty like yours feels rare because it is effortless.',
    'Grace and beauty shine through you in a way that feels deeply personal.'
  ],
  skincareTips: [
    'Keep a gentle cleanser, lightweight moisturizer, and SPF as your daily glow trio.',
    'Hydrate consistently and add water-rich foods like cucumber, citrus, and tender coconut.',
    'Use niacinamide or aloe-based care for calm, even-looking skin if it suits your skin type.',
    'Avoid harsh scrubs; choose soft exfoliation once or twice a week for a polished glow.',
    'Change pillow covers often and remove makeup fully before sleep to help prevent breakouts.'
  ],
  comparisons: [
    'Radiance comparable to timeless elegance.',
    'Natural charm like classic beauty icons.',
    'Grace that stands uniquely on its own.'
  ]
};

function normalizeAnalysis(input) {
  const source = input && typeof input === 'object' ? input : {};
  const score = Number.parseInt(source.beautyScore, 10);

  return {
    beautyScore: Number.isFinite(score) ? Math.min(100, Math.max(1, score)) : 94,
    summary: String(source.summary || previewAnalysis.summary).slice(0, 260),
    compliments: Array.isArray(source.compliments) && source.compliments.length
      ? source.compliments.map(String).filter(Boolean).slice(0, 6)
      : previewAnalysis.compliments,
    skincareTips: Array.isArray(source.skincareTips) && source.skincareTips.length
      ? source.skincareTips.map(String).filter(Boolean).slice(0, 8)
      : previewAnalysis.skincareTips,
    comparisons: Array.isArray(source.comparisons) && source.comparisons.length
      ? source.comparisons.map(String).filter(Boolean).slice(0, 4)
      : previewAnalysis.comparisons
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { imageBase64 } = req.body || {};
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ message: 'No image received.' });
  }

  if (imageBase64.length > 6 * 1024 * 1024) {
    return res.status(413).json({ message: 'Image too large. Please upload one under 4 MB.' });
  }

  if (!hasGroqKey()) {
    return res.status(200).json({
      analysis: previewAnalysis,
      source: 'local-preview',
      setupRequired: true,
      message: 'Add GROQ_API_KEY to enable live AI vision analysis.'
    });
  }

  const prompt = `You are a premium AI beauty and skincare guide creating a respectful, uplifting analysis for Spoorthi.

Return strict JSON only:
{
  "beautyScore": number from 85 to 100,
  "summary": "one emotionally warm sentence for Spoorthi",
  "compliments": ["4 to 6 respectful, specific, positive lines"],
  "skincareTips": ["5 to 8 practical, gentle skincare suggestions based on visible skin cues only"],
  "comparisons": ["3 elegant uplifting comparison lines, never negative"]
}

Rules:
- Keep the tone luxurious, affectionate, respectful, and confidence-building.
- Do not identify the person, estimate age, infer ethnicity, or mention sensitive traits.
- Do not diagnose medical conditions.
- Do not compare negatively or rank against real people.
- If image quality is limited, give gentle general skincare guidance.`;

  try {
    const data = await groqChatCompletion({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      max_tokens: 1100,
      temperature: 0.75,
      top_p: 0.92,
      response_format: { type: 'json_object' }
    });

    const raw = data.choices?.[0]?.message?.content || '';
    const parsed = extractJsonObject(raw);
    if (!parsed) throw new Error('Bad beauty-analysis JSON shape.');

    return res.status(200).json({
      analysis: normalizeAnalysis(parsed),
      source: 'groq'
    });
  } catch (error) {
    console.error('Beauty API Error:', error);
    return res.status(502).json({
      message: 'The beauty analysis could not complete. Please try another image or check the Groq configuration.'
    });
  }
}
