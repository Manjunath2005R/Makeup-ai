import {
  hasValidImage,
  requestGroq,
  requireApiKey,
  requirePost,
} from "./_lib/groq.js";

export default async function handler(req, res) {
  if (!requirePost(req, res) || !requireApiKey(res)) {
    return;
  }

  const { imageBase64, regenerate, avoid } = req.body || {};

  if (!hasValidImage(imageBase64)) {
    return res.status(400).json({ message: "No image received." });
  }

  if (imageBase64.length > 6 * 1024 * 1024) {
    return res.status(413).json({ message: "Image too large. Please upload one under 4 MB." });
  }

  const styles = [
    "cinematic one-liner",
    "soft poetic whisper",
    "witty Instagram-ready quip",
    "bold dramatic film-poster tagline",
    "tender journal-entry line",
    "mysterious, slightly magical",
    "playful pun with heart",
    "quiet philosophical observation",
    "warm Sandalwood-cinema styled line",
  ];

  const style = styles[Math.floor(Math.random() * styles.length)];

  const systemPrompt = `You are the Caption Oracle - a world-class copywriter who fuses vision with poetry. You are writing one perfect caption for the image.

Style for this attempt: ${style}.
${
  regenerate
    ? `This is a regeneration. Give a completely different angle from before. Do not repeat anything resembling: "${String(
        avoid || ""
      ).slice(0, 200)}".`
    : ""
}

Hard rules:
1. Look at the image carefully and ground the caption in a visible detail.
2. Output one caption only. 4 to 18 words. No quotes, no emojis, no hashtags.
3. No generic cliches.
4. No labels such as "Caption:".
5. English, simple, classy.`;

  try {
    const data = await requestGroq({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: systemPrompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      max_tokens: 80,
      temperature: regenerate ? 1.05 : 0.85,
      top_p: 0.95,
      presence_penalty: 0.7,
      frequency_penalty: 0.6,
    });

    let caption = (data.choices?.[0]?.message?.content || "").trim();
    caption = caption.replace(/^["'`]+|["'`]+$/g, "").replace(/^caption[:\-\s]+/i, "").trim();

    if (!caption) {
      return res.status(502).json({ message: "The oracle whispered, but no words came through." });
    }

    res.status(200).json({ caption, style });
  } catch (error) {
    console.error("Caption API Error:", error);
    res.status(500).json({ message: "The caption oracle is resting right now." });
  }
}
