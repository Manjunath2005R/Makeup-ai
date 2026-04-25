import { groqChatCompletion, hasGroqKey } from './lib/groq';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};

const fallbackRecipes = {
  North: {
    name: 'Jeera Aloo',
    region: 'North India',
    description: 'Golden potatoes tossed with cumin, chilli, and coriander for a comforting dinner plate.',
    serves: '2 people',
    prepTime: '10 minutes',
    cookTime: '15 minutes',
    ingredients: ['2 medium potatoes', '1 tsp cumin seeds', '2 tbsp oil', 'Salt to taste', '1/2 tsp red chilli powder', 'Fresh coriander'],
    steps: [
      'Boil and peel the potatoes, then cut them into small cubes.',
      'Heat oil in a pan on medium flame.',
      'Add cumin seeds and let them crackle.',
      'Add potatoes and toss until coated with the cumin oil.',
      'Add salt and red chilli powder.',
      'Cook for 5 to 7 minutes, tossing occasionally.',
      'Finish with fresh coriander and serve hot.'
    ],
    tip: 'Cool the boiled potatoes before cubing so they hold shape and crisp lightly.'
  },
  South: {
    name: 'Tomato Rice',
    region: 'South India',
    description: 'A bright, tangy rice dish with tomatoes, curry leaves, and gentle spice.',
    serves: '2 people',
    prepTime: '10 minutes',
    cookTime: '20 minutes',
    ingredients: ['2 cups cooked rice', '2 medium tomatoes', '1 small onion', '1 tsp mustard seeds', '8 curry leaves', '1 tbsp oil', 'Salt to taste'],
    steps: [
      'Heat oil in a pan and add mustard seeds.',
      'Add curry leaves and sliced onion.',
      'Cook until the onion turns soft.',
      'Add chopped tomatoes and salt.',
      'Cook until the tomatoes become thick and glossy.',
      'Add cooked rice and mix gently.',
      'Rest for 3 minutes before serving.'
    ],
    tip: 'Use cooled rice so every grain stays separate.'
  },
  Snacks: {
    name: 'Masala Corn Chaat',
    region: 'Indian street food',
    description: 'Sweet corn dressed with butter, lime, chilli, and fresh herbs for a quick bright snack.',
    serves: '2 people',
    prepTime: '5 minutes',
    cookTime: '8 minutes',
    ingredients: ['2 cups sweet corn', '1 tbsp butter', '1/2 tsp chaat masala', '1/2 tsp red chilli powder', '1 tbsp lime juice', 'Fresh coriander', 'Salt to taste'],
    steps: [
      'Boil sweet corn until tender.',
      'Drain well and place it in a bowl.',
      'Add butter while the corn is hot.',
      'Mix in salt, chilli powder, and chaat masala.',
      'Add lime juice and coriander.',
      'Taste and adjust salt or lime.',
      'Serve warm.'
    ],
    tip: 'Add lime at the end so the flavour stays fresh and sharp.'
  }
};

function sanitizeRecipe(recipe, category) {
  const base = fallbackRecipes[category];
  const safe = recipe && typeof recipe === 'object' ? recipe : base;

  return {
    name: String(safe.name || base.name).trim(),
    region: String(safe.region || base.region).trim(),
    description: String(safe.description || base.description).trim(),
    serves: String(safe.serves || base.serves).trim(),
    prepTime: String(safe.prepTime || base.prepTime).trim(),
    cookTime: String(safe.cookTime || base.cookTime).trim(),
    tip: String(safe.tip || base.tip).trim(),
    ingredients: Array.isArray(safe.ingredients) ? safe.ingredients.map(String).filter(Boolean).slice(0, 25) : base.ingredients,
    steps: Array.isArray(safe.steps) ? safe.steps.map(String).filter(Boolean).slice(0, 14) : base.steps
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { category, avoidList } = req.body || {};
  const allowed = ['North', 'South', 'Snacks'];
  if (!allowed.includes(category)) {
    return res.status(400).json({ message: 'Invalid category. Choose North, South or Snacks.' });
  }

  if (!hasGroqKey()) {
    return res.status(200).json({
      recipe: sanitizeRecipe(fallbackRecipes[category], category),
      fallback: true,
      setupRequired: true,
      message: 'Add GROQ_API_KEY to enable live AI recipe generation.'
    });
  }

  const hints = {
    North: 'North Indian home cooking: dal makhani, chole, rajma chawal, paneer butter masala, baingan bharta, biryani, parathas, pulao, kadhi, aloo gobi. Pick varied regions such as Punjab, UP, Rajasthan, Kashmir, or Delhi.',
    South: 'South Indian home cooking: dosa varieties, sambar, rasam, bisi bele bath, Mysore masala dosa, Chettinad chicken, appam with stew, avial, puliyogare, akki rotti, ragi mudde, Mangalorean curries, Hyderabadi biryani, Kerala fish moilee.',
    Snacks: 'Indian snacks and street food: masala puri, pani puri, dabeli, pav bhaji, mirchi bajji, Mysore bonda, medu vada, samosa, kachori, egg puff, masala corn, cutlets, chaats, chakli, nippattu.'
  };

  const avoid = Array.isArray(avoidList) ? avoidList.filter(Boolean).slice(0, 25) : [];
  const avoidBlock = avoid.length
    ? `Do not suggest these previously shown dishes or close variations: ${avoid.map((name) => `"${name}"`).join(', ')}.`
    : '';

  const systemPrompt = `You are a warm, expert Indian home chef inside Spoorthi's premium beauty-and-comfort app.

Category: ${category}
Cuisine hint: ${hints[category]}
${avoidBlock}

Rules:
1. Pick one dish that feels exciting, home-makeable, and comforting.
2. Use simple Indian English. Short, direct sentences a beginner can follow.
3. Ingredients must use home measures such as cups, tsp, tbsp, a handful, or 1 medium onion.
4. Steps must be numbered in meaning, but returned as JSON array strings. Use 6 to 10 short actionable steps.
5. Include realistic prep time, cook time, servings.
6. Include one genuine chef's tip that changes the outcome.
7. No emojis. No markdown. No preamble. Output strict JSON only.

JSON shape:
{
  "name": "dish name",
  "region": "specific region or tradition",
  "description": "one mouth-watering sentence",
  "serves": "e.g. 2 people",
  "prepTime": "e.g. 15 minutes",
  "cookTime": "e.g. 30 minutes",
  "ingredients": ["string"],
  "steps": ["string"],
  "tip": "one genuine chef's tip"
}`;

  try {
    const data = await groqChatCompletion({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Give Spoorthi a ${category} dish recipe now.${avoid.length ? ' Avoid repeats.' : ''}` }
      ],
      max_tokens: 1200,
      temperature: 0.95,
      top_p: 0.95,
      presence_penalty: 0.5,
      frequency_penalty: 0.6,
      response_format: { type: 'json_object' }
    });

    const raw = data.choices?.[0]?.message?.content || '';
    const recipe = JSON.parse(raw);
    return res.status(200).json({ recipe: sanitizeRecipe(recipe, category) });
  } catch (error) {
    console.error('Menu API Error:', error);
    return res.status(200).json({
      recipe: sanitizeRecipe(fallbackRecipes[category], category),
      fallback: true,
      message: 'Recipe generation fell back to a curated local suggestion.'
    });
  }
}
