const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

/* -------------------------
   GET DATA FROM BOTH SOURCES
------------------------- */
const staticRecipes = Array.isArray(window.recipesData) ? window.recipesData : [];
const localRecipesRaw = JSON.parse(localStorage.getItem("recipes")) || [];

/* normalize admin recipes باش يولو نفس structure */
const localRecipes = localRecipesRaw.map((recipe, index) => ({
  id: recipe.id || Date.now() + index,
  slug: recipe.slug || (recipe.title ? recipe.title.toLowerCase().replace(/\s+/g, "-") : `recipe-${index}`),
  title: recipe.title || "Untitled Recipe",
  category: recipe.category || "General",
  image: recipe.image && recipe.image.trim() !== ""
    ? recipe.image
    : "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
  prepTime: recipe.prepTime || "15 min",
  cookTime: recipe.cookTime || "30 min",
  servings: recipe.servings || 4,
  description: recipe.description || "Delicious homemade recipe prepared step by step.",
  ingredients: Array.isArray(recipe.ingredients)
    ? recipe.ingredients.filter(Boolean)
    : typeof recipe.ingredients === "string"
      ? recipe.ingredients.split(",").map(item => item.trim()).filter(Boolean)
      : ["Ingredients not provided"],
  steps: Array.isArray(recipe.steps)
    ? recipe.steps.filter(Boolean)
    : typeof recipe.steps === "string"
      ? recipe.steps.split(",").map(item => item.trim()).filter(Boolean)
      : ["Steps not provided"]
}));

/* جمع كلشي */
const allRecipes = [...staticRecipes, ...localRecipes];

/* -------------------------
   RECIPES PAGE
------------------------- */
const recipeGrid = document.getElementById("recipeGrid");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
let currentFilter = "all";
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

function createRecipeCard(recipe, index = 0) {
  const delayClass =
    index % 3 === 1 ? "delay-1" :
    index % 3 === 2 ? "delay-2" : "";

  const card = document.createElement("a");
  card.href = "recipe-details.html";
  card.className = `recipe-card recipe-item reveal ${delayClass}`;
  card.setAttribute("data-category", recipe.category.toLowerCase());
  card.setAttribute("data-name", recipe.title.toLowerCase());

  card.innerHTML = `
    <span class="favorite-heart">${favorites.includes(recipe.title) ? "❤️" : "♡"}</span>

    <div class="recipe-image-wrap-card">
      <img src="${recipe.image}" alt="${recipe.title}">
    </div>

    <div class="recipe-card-content">
      <span class="badge">${recipe.category}</span>
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>

      <div class="recipe-meta-mini">
        <span>⏱ ${recipe.prepTime}</span>
        <span>🍳 ${recipe.cookTime}</span>
        <span>🍽 ${recipe.servings}</span>
      </div>

      <span class="card-arrow">→</span>
    </div>
  `;

  const heart = card.querySelector(".favorite-heart");

  heart.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (favorites.includes(recipe.title)) {
      favorites = favorites.filter(item => item !== recipe.title);
      heart.textContent = "♡";
    } else {
      favorites.push(recipe.title);
      heart.textContent = "❤️";
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
  });

  card.addEventListener("click", () => {
    localStorage.setItem("selectedRecipe", JSON.stringify(recipe));
  });

  return card;
}

function renderRecipes(recipes) {
  if (!recipeGrid) return;

  recipeGrid.innerHTML = "";

  if (!recipes.length) {
    recipeGrid.innerHTML = `
      <div class="empty-state">
        <h3>No recipes found</h3>
        <p>Try another search or another category.</p>
      </div>
    `;
    return;
  }

  recipes.forEach((recipe, index) => {
    recipeGrid.appendChild(createRecipeCard(recipe, index));
  });

  revealOnScroll();
}

function filterRecipes() {
  const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const filtered = allRecipes.filter((recipe) => {
    const recipeCategory = recipe.category.toLowerCase();
    const recipeTitle = recipe.title.toLowerCase();
    const recipeDescription = recipe.description.toLowerCase();

    const matchesCategory =
      currentFilter === "all" || recipeCategory === currentFilter;

    const matchesSearch =
      recipeTitle.includes(searchValue) || recipeDescription.includes(searchValue);

    return matchesCategory && matchesSearch;
  });

  renderRecipes(filtered);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    currentFilter = button.getAttribute("data-filter").toLowerCase();
    filterRecipes();
  });
});

if (searchInput) {
  searchInput.addEventListener("input", filterRecipes);
}

/* -------------------------
   DETAILS PAGE
------------------------- */
const recipeTitle = document.getElementById("recipeTitle");
const recipeCategory = document.getElementById("recipeCategory");
const recipeDescription = document.getElementById("recipeDescription");
const recipePrep = document.getElementById("recipePrep");
const recipeCook = document.getElementById("recipeCook");
const recipeServings = document.getElementById("recipeServings");
const recipeImage = document.getElementById("recipeImage");
const ingredientsList = document.getElementById("ingredientsList");
const stepsList = document.getElementById("stepsList");

function renderRecipeDetails() {
  if (!recipeTitle) return;

  const selectedRecipe = JSON.parse(localStorage.getItem("selectedRecipe"));

  if (!selectedRecipe) {
    recipeTitle.textContent = "Recipe not found";
    return;
  }

  recipeCategory.textContent = selectedRecipe.category || "General";
  recipeTitle.textContent = selectedRecipe.title || "Untitled Recipe";
  recipeDescription.textContent =
    selectedRecipe.description || "Delicious recipe prepared step by step.";

  recipePrep.textContent = selectedRecipe.prepTime || "15 min";
  recipeCook.textContent = selectedRecipe.cookTime || "30 min";
  recipeServings.textContent = selectedRecipe.servings || 4;

  recipeImage.src = selectedRecipe.image || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80";
  recipeImage.alt = selectedRecipe.title || "Recipe image";

  ingredientsList.innerHTML = "";
  (selectedRecipe.ingredients || []).forEach((ingredient) => {
    const li = document.createElement("li");
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });

  stepsList.innerHTML = "";
  (selectedRecipe.steps || []).forEach((step, index) => {
    const stepCard = document.createElement("div");
    stepCard.className = "step-card reveal";
    stepCard.innerHTML = `
      <div class="step-number">${index + 1}</div>
      <div>
        <h3>Step ${index + 1}</h3>
        <p>${step}</p>
      </div>
    `;
    stepsList.appendChild(stepCard);
  });

  revealOnScroll();
}

/* -------------------------
   REVEAL ANIMATION
------------------------- */
function revealOnScroll() {
  const revealItems = document.querySelectorAll(".reveal");
  const windowHeight = window.innerHeight;

  revealItems.forEach((item) => {
    const elementTop = item.getBoundingClientRect().top;
    const visiblePoint = 100;

    if (elementTop < windowHeight - visiblePoint) {
      item.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", () => {
  renderRecipes(allRecipes);
  renderRecipeDetails();
  revealOnScroll();
});