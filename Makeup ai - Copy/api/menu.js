import { requestGroq, requirePost } from "./_lib/groq.js";

export default async function handler(req, res) {
  if (!requirePost(req, res)) {
    return;
  }

  const { category, avoidList } = req.body || {};
  const allowed = ["North", "South", "Snacks"];

  if (!allowed.includes(category)) {
    return res.status(400).json({ message: "Invalid category. Choose North, South or Snacks." });
  }

  const hints = {
    North:
      "North Indian home cooking - think dal makhani, chole, rajma chawal, paneer butter masala, baingan bharta, biryani, parathas, pulao, kadhi, aloo gobi. Pick varied regions such as Punjab, UP, Rajasthan, Kashmir, and Delhi.",
    South:
      "South Indian home cooking - dosa varieties, sambar, rasam, bisi bele bath, Mysore masala dosa, Chettinad chicken, appam with stew, avial, puliyogare, akki rotti, ragi mudde, Mangalorean curries, Hyderabadi biryani, Kerala fish moilee.",
    Snacks:
      "Indian snacks and street food - masala puri, pani puri, dabeli, pav bhaji, mirchi bajji, Mysore bonda, medu vada, samosa, kachori, keema pav, egg puff, masala corn, cutlets, chaats, chakli, nippattu.",
  };

  const avoid = Array.isArray(avoidList) ? avoidList.filter(Boolean).slice(0, 25) : [];
  const avoidBlock = avoid.length
    ? `\n\nSTRICT: Do not suggest any of these previously shown dishes or close variations: ${avoid
        .map((name) => `"${name}"`)
        .join(", ")}.`
    : "";

  const systemPrompt = `You are Paati's Kitchen Oracle - a warm, expert Indian home chef who teaches with clarity. You are writing a cooking guide for Spoorthi.

Category: ${category}
Cuisine hint: ${hints[category]}
${avoidBlock}

Rules:
1. Pick one dish that feels exciting and home-makeable tonight.
2. Use simple, clean Indian English.
3. Ingredients should use home measures.
4. Steps must be numbered, 6 to 10 short actionable steps.
5. Include realistic prep time, cook time, and servings.
6. Include one genuine chef's tip.
7. Output JSON only.

OUTPUT SHAPE:
{
  "name": "string",
  "region": "string",
  "description": "string",
  "serves": "string",
  "prepTime": "string",
  "cookTime": "string",
  "ingredients": ["string"],
  "steps": ["string"],
  "tip": "string"
}`;

  if (!process.env.GROQ_API_KEY) {
    return res.status(200).json({
      recipe: {
        name: category === "North" ? "Jeera Aloo" : category === "South" ? "Tomato Rice" : "Masala Corn Chaat",
        region: category === "North" ? "North India" : category === "South" ? "South India" : "Indian street food",
        description: "A quick, warming, everyday favourite that tastes better than it looks.",
        serves: "2 people",
        prepTime: "10 minutes",
        cookTime: "15 minutes",
        ingredients: [
          "2 medium potatoes",
          "1 tsp cumin seeds",
          "2 tbsp oil",
          "Salt to taste",
          "Red chilli powder",
          "Fresh coriander",
        ],
        steps: [
          "Boil and peel the potatoes, then cut them into small cubes.",
          "Heat oil in a pan on medium flame.",
          "Add cumin seeds and let them crackle.",
          "Add potatoes and toss to coat with oil.",
          "Add salt and red chilli powder.",
          "Cook for 5 minutes, tossing occasionally.",
          "Finish with fresh coriander and serve hot.",
        ],
        tip: "Cool the boiled potatoes fully before cubing so they hold shape and crisp well.",
      },
      fallback: true,
    });
  }

  try {
    const data = await requestGroq({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Give Spoorthi a ${category} dish recipe now.${avoid.length ? " Avoid repeats." : ""}`,
        },
      ],
      max_tokens: 1200,
      temperature: 0.95,
      top_p: 0.95,
      presence_penalty: 0.5,
      frequency_penalty: 0.6,
      response_format: { type: "json_object" },
    });

    const raw = data.choices?.[0]?.message?.content?.trim() || "{}";
    const recipe = JSON.parse(raw);

    if (!recipe.name || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
      throw new Error("Bad recipe shape");
    }

    res.status(200).json({
      recipe: {
        name: String(recipe.name).trim(),
        region: String(recipe.region || "").trim(),
        description: String(recipe.description || "").trim(),
        serves: String(recipe.serves || "").trim(),
        prepTime: String(recipe.prepTime || "").trim(),
        cookTime: String(recipe.cookTime || "").trim(),
        tip: String(recipe.tip || "").trim(),
        ingredients: recipe.ingredients.map((item) => String(item).trim()).filter(Boolean).slice(0, 25),
        steps: recipe.steps.map((item) => String(item).trim()).filter(Boolean).slice(0, 14),
      },
    });
  } catch (error) {
    console.error("Menu API Error:", error);
    res.status(500).json({ message: "The recipe oracle could not prepare a dish right now." });
  }
}
