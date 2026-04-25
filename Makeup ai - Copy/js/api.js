async function postJson(path, payload) {
  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.message || "The request could not be completed.";
    throw new Error(message);
  }

  return data;
}

export function analyzeBeauty(imageBase64) {
  return postJson("/api/analyze", { imageBase64 });
}

export function generateRecipe(category, avoidList) {
  return postJson("/api/menu", { category, avoidList });
}

export function generateCaption(imageBase64, regenerate, avoid) {
  return postJson("/api/caption", { imageBase64, regenerate, avoid });
}
