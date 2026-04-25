import { groqChatCompletion, hasGroqKey } from './lib/groq';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '7mb'
    }
  }
};

const previewCaptions = [
  'Soft light found its favorite place today',
  'Grace looks effortless when the moment is honest',
  'A quiet glow with a story of its own',
  'Elegance, captured before it knew it was timeless',
  'Warmth in the frame, confidence in the silence'
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { imageBase64, regenerate, avoid } = req.body || {};
  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ message: 'No image received.' });
  }

  if (imageBase64.length > 6 * 1024 * 1024) {
    return res.status(413).json({ message: 'Image too large. Please upload one under 4 MB.' });
  }

  const styles = [
    'cinematic one-liner',
    'soft poetic whisper',
    'witty Instagram-ready quip',
    'bold dramatic film-poster tagline',
    'tender journal-entry line',
    'mysterious and slightly magical',
    'playful line with heart',
    'quiet philosophical observation',
    'warm Sandalwood-cinema styled line'
  ];
  const style = styles[Math.floor(Math.random() * styles.length)];

  if (!hasGroqKey()) {
    const caption = previewCaptions.find((line) => line !== avoid) || previewCaptions[0];
    return res.status(200).json({
      caption,
      style: 'local preview',
      setupRequired: true,
      message: 'Add GROQ_API_KEY to enable live AI vision captions.'
    });
  }

  const systemPrompt = `You are the Caption Oracle inside Spoorthi's premium beauty app, a world-class copywriter who fuses vision with poetry.

Style for this attempt: ${style}.
${regenerate ? `This is a regeneration. Give a completely different angle from before. Do not repeat text resembling: "${String(avoid || '').slice(0, 200)}".` : ''}

Hard rules:
1. Look at the image carefully and ground the caption in a visible detail.
2. Output one caption only. 4 to 18 words. No quotes, no emojis, no hashtags.
3. Avoid generic cliches.
4. No label such as "Caption:".
5. Make it classy, warm, and image-specific.`;

  try {
    const data = await groqChatCompletion({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: systemPrompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      max_tokens: 80,
      temperature: regenerate ? 1.05 : 0.85,
      top_p: 0.95,
      presence_penalty: 0.7,
      frequency_penalty: 0.6
    });

    let caption = (data.choices?.[0]?.message?.content || '').trim();
    caption = caption.replace(/^["'`]+|["'`]+$/g, '').replace(/^caption[:\-\s]+/i, '').trim();

    if (!caption) {
      return res.status(502).json({ message: 'The caption oracle whispered, but no words came through.' });
    }

    return res.status(200).json({ caption, style });
  } catch (error) {
    console.error('Caption API Error:', error);
    return res.status(500).json({ message: 'The caption oracle is resting right now.' });
  }
}
