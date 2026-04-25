import { generateRecipe } from "./api.js";
import { setStatus } from "./utils.js";

const categoryButtons = document.querySelectorAll("[data-category]");
const submitButton = document.querySelector("#recipe-submit");
const refreshButton = document.querySelector("#recipe-refresh");
const status = document.querySelector("#recipe-status");
const avoidList = document.querySelector("#avoid-list");
const clearAvoidButton = document.querySelector("#clear-avoid-list");

const recipeName = document.querySelector("#recipe-name");
const recipeDescription = document.querySelector("#recipe-description");
const recipeMeta = document.querySelector("#recipe-meta");
const ingredientsList = document.querySelector("#recipe-ingredients");
const stepsList = document.querySelector("#recipe-steps");
const recipeTip = document.querySelector("#recipe-tip");

let activeCategory = "North";
let shownDishes = [];

function renderAvoidList() {
  avoidList.innerHTML = "";

  if (!shownDishes.length) {
    const empty = document.createElement("span");
    empty.className = "empty-chip";
    empty.textContent = "Generated dishes are remembered here to avoid repeats.";
    avoidList.appendChild(empty);
    return;
  }

  shownDishes.forEach((dish) => {
    const chip = document.createElement("span");
    chip.className = "compliment-chip";
    chip.textContent = dish;
    avoidList.appendChild(chip);
  });
}

function renderRecipe(recipe) {
  recipeName.textContent = recipe.name;
  recipeDescription.textContent = recipe.description;
  recipeMeta.innerHTML = `
    <span>${recipe.region || "Region pending"}</span>
    <span>${recipe.serves || "Serves not available"}</span>
    <span>${recipe.prepTime || "Prep time pending"}</span>
    <span>${recipe.cookTime || "Cook time pending"}</span>
  `;

  ingredientsList.innerHTML = "";
  recipe.ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  stepsList.innerHTML = "";
  recipe.steps.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    stepsList.appendChild(li);
  });

  recipeTip.textContent = recipe.tip || "No chef's tip was provided for this recipe.";
}

async function requestRecipe() {
  try {
    setStatus(status, `Generating a ${activeCategory} recipe...`);
    submitButton.disabled = true;
    refreshButton.disabled = true;

    const data = await generateRecipe(activeCategory, shownDishes);
    renderRecipe(data.recipe);

    if (!shownDishes.includes(data.recipe.name)) {
      shownDishes = [...shownDishes, data.recipe.name].slice(-8);
      renderAvoidList();
    }

    setStatus(
      status,
      data.fallback ? "Fallback recipe shown because the live API was unavailable." : "Recipe generated.",
      data.fallback ? "error" : "success"
    );
  } catch (error) {
    setStatus(status, error.message, "error");
  } finally {
    submitButton.disabled = false;
    refreshButton.disabled = false;
  }
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    categoryButtons.forEach((node) => node.classList.remove("is-active"));
    button.classList.add("is-active");
  });
});

submitButton.addEventListener("click", requestRecipe);
refreshButton.addEventListener("click", requestRecipe);

clearAvoidButton.addEventListener("click", () => {
  shownDishes = [];
  renderAvoidList();
  setStatus(status, "Shown dishes were cleared. The oracle can suggest them again.");
});

renderAvoidList();
