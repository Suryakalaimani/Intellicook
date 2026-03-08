// ============ STATE MANAGEMENT ============
const app = {
  vegOnly: JSON.parse(localStorage.getItem('vegOnly')) || false,
  recipes: [],
  mealPlan: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: []
  },
  generatedRecipe: null,
  currentMealToAdd: null,
  // Guard to prevent duplicate/rapid selections
  _selectionInProgress: false,
  currentPlanDate: new Date().toISOString().split('T')[0]
};

// ============ INITIALIZATION ============
// Initialization is handled by `initializeApp()` at the end of the file

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => navigateTo(e.target.dataset.page));
  });

  // Veg Toggle
  document.getElementById('veg-only').addEventListener('change', (e) => {
    app.vegOnly = e.target.checked;
    localStorage.setItem('vegOnly', JSON.stringify(app.vegOnly));
    loadCookbook();
  });

  // Cook Book Events
  document.getElementById('recipe-search').addEventListener('input', filterRecipes);
  document.getElementById('cuisine-filter').addEventListener('change', filterRecipes);
  document.getElementById('diet-filter').addEventListener('change', filterRecipes);
  // Calories slider: update label and filter on input
  const calEl = document.getElementById('calories-filter');
  const calLabel = document.getElementById('calories-label');
  if (calEl && calLabel) {
    calLabel.textContent = `Calories: 0–${calEl.value}`;
    calEl.addEventListener('input', (e) => {
      calLabel.textContent = `Calories: 0–${e.target.value}`;
      filterRecipes();
    });
  }

  // Protein slider: placed inside same filter container, dynamic label and filtering
  const protEl = document.getElementById('protein-filter');
  const protLabel = document.getElementById('protein-label');
  if (protEl && protLabel) {
    protLabel.textContent = `Protein: 0–${protEl.value} g`;
    protEl.addEventListener('input', (e) => {
      protLabel.textContent = `Protein: 0–${e.target.value} g`;
      filterRecipes();
    });
  }

  // Recipe Generator Events
  document.getElementById('generator-form').addEventListener('submit', generateRecipe);
  // Global click delegation (single attachment) handles many UI actions including pre-rendered meal buttons
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Generated recipe add button (id)
    if (target.closest('#add-to-planner-gen')) {
      addGeneratedRecipeToPlanner();
      return;
    }

    // "+ Add Meal" buttons in planner (use closest to handle inner clicks)
    const plannerAddBtn = target.closest('button[data-meal][data-action="add"]');
    if (plannerAddBtn) {
      app.currentMealToAdd = plannerAddBtn.dataset.meal;
      showRecipeModal(plannerAddBtn.dataset.meal);
      return;
    }

    // Recipe option clicked inside modal (use closest so clicks on children register)
    const recipeOption = target.closest('.recipe-option');
    if (recipeOption) {
      selectRecipeForMeal(recipeOption);
      return;
    }

    // Pre-rendered meal-selection buttons inside modal (choose breakfast/lunch/dinner/snacks)
    const mealSelectBtn = target.closest('[data-meal-select]');
    if (mealSelectBtn) {
      const mealType = mealSelectBtn.dataset.mealSelect;
      if (app._pendingMealRecipe) {
        // add with standardized shape
        addRecipeToMeal(app._pendingMealRecipe, mealType, app._pendingMealRecipe.source || 'cookbook');
      }
      return;
    }

    // Remove meal item (use closest to get the button)
    const removeBtn = target.closest('.meal-item-remove');
    if (removeBtn) {
      removeMealItem(removeBtn);
      return;
    }

    // Close modal button
    const closeBtn = target.closest('.close-modal');
    if (closeBtn) {
      closeRecipeModal();
      return;
    }
  });

  // Meal Planner Events
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('plan-date').value = today;
  app.currentPlanDate = today;
  updatePlanDateDisplay();
  document.getElementById('plan-date').addEventListener('change', (e) => {
    app.currentPlanDate = e.target.value;
    app.mealPlan = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    updatePlanDateDisplay();
    updateMealDisplay('breakfast');
    updateMealDisplay('lunch');
    updateMealDisplay('dinner');
    updateMealDisplay('snacks');
    updateCalorieTracker();
  });
  document.getElementById('load-plan-btn').addEventListener('click', loadMealPlan);
  document.getElementById('save-plan-btn').addEventListener('click', saveMealPlan);

  // Modal close on outside click
  document.getElementById('recipe-modal').addEventListener('click', (e) => {
    if (e.target.id === 'recipe-modal') closeRecipeModal();
  });
}

// ============ ADD-TO-MEAL HELPER (Unified Flow) ============
/**
 * Standardized add-to-meal flow used across cookbook and AI generated recipes.
 * Ensures recipe object has required fields, prevents duplicates, updates UI immediately,
 * and clears pending state so a single user action cannot add multiple times.
 */
function addRecipeToMeal(rawRecipe, mealType, source = 'cookbook') {
  if (!rawRecipe) return;
  if (!mealType) {
    // If mealType is not provided, show meal selection modal
    showMealSelectionModal(rawRecipe);
    return;
  }

  // Build a standard recipe object with guaranteed fields
  const std = {
    id: Date.now(),
    title: rawRecipe.title || rawRecipe.name || 'Untitled Recipe',
    approxCalories: Number(rawRecipe.approxCalories || rawRecipe.calories || 0) || 0,
    protein: Number(rawRecipe.protein || 0) || 0,
    mealType,
    source: source || rawRecipe.source || 'cookbook',
    // keep original payload for future reference (non-essential fields)
    _raw: rawRecipe
  };

  // Prevent accidental duplicate additions to the same meal
  const exists = app.mealPlan[mealType].some(i => i.title === std.title && i.source === std.source);
  if (exists) {
    // Clear pending and close modal to avoid repeated additions
    app._pendingMealRecipe = null;
    closeRecipeModal();
    return;
  }

  // Add instantly and update UI first
  app.mealPlan[mealType].push(std);
  updateMealDisplay(mealType);
  updateCalorieTracker();

  // Clear transient state and close modal
  app._pendingMealRecipe = null;
  closeRecipeModal();
}

function showMainApp() {
  document.getElementById('veg-only').checked = app.vegOnly;
  navigateTo('cookbook');
}

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(page + '-page').classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
}

// ============ COOK BOOK FUNCTIONS ============
async function loadCookbook() {
  try {
    document.getElementById('cookbook-loading').style.display = 'block';
    document.getElementById('cookbook-error').textContent = '';

    // Prefer API, but fall back to local static JSON for development or if API is not available
    let cookbooks = [];
    try {
      const response = await fetch('/api/cookbooks');
      if (response.ok) {
        cookbooks = await response.json();
      } else {
        console.warn('API /api/cookbooks returned non-OK, falling back to local data');
      }
    } catch (apiErr) {
      console.warn('API fetch failed, falling back to local data:', apiErr.message);
    }

    if (!cookbooks || cookbooks.length === 0) {
      try {
        const localResp = await fetch('data/cookbook.json');
        if (localResp.ok) {
          cookbooks = await localResp.json();
          console.info('Loaded cookbook from local `data/cookbook.json` (fallback)');
        } else {
          console.warn('Local cookbook.json not found or unreadable');
        }
      } catch (localErr) {
        console.error('Failed to load local cookbook.json:', localErr.message);
      }
    }

    app.recipes = Array.isArray(cookbooks) ? cookbooks : [];
    console.debug('Loaded recipes count:', app.recipes.length);
    filterRecipes();
    document.getElementById('cookbook-loading').style.display = 'none';
  } catch (error) {
    document.getElementById('cookbook-error').textContent = 'Failed to load recipes: ' + error.message;
    document.getElementById('cookbook-loading').style.display = 'none';
  }
}

function filterRecipes() {
  const search = document.getElementById('recipe-search').value.toLowerCase();
  const cuisine = document.getElementById('cuisine-filter').value;
  const diet = document.getElementById('diet-filter').value;
  const maxCalories = parseInt(document.getElementById('calories-filter').value) || 500;
  const maxProtein = parseInt(document.getElementById('protein-filter')?.value) || 200;

  let filtered = app.recipes.filter(recipe => {
    const matchSearch = recipe.title.toLowerCase().includes(search) ||
      recipe.description?.toLowerCase().includes(search);
    const matchRegion = cuisine === '' || recipe.cuisine === cuisine;
    const matchDiet = diet === '' || (diet === 'veg' ? recipe.isVegetarian : !recipe.isVegetarian);
    const matchCalories = (recipe.approxCalories || 0) <= maxCalories;
    const matchProtein = (recipe.protein || 0) <= maxProtein;
    const matchVegOnly = !app.vegOnly || recipe.isVegetarian;

    return matchSearch && matchRegion && matchDiet && matchCalories && matchProtein && matchVegOnly;
  });

  renderRecipes(filtered);
}

function renderRecipes(recipes) {
  const grid = document.getElementById('recipes-grid');
  grid.innerHTML = '';

  if (recipes.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No recipes found</p>';
    return;
  }

  recipes.forEach(recipe => {
    const card = createRecipeCard(recipe);
    grid.appendChild(card);
  });
}

function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card';

  const vegBadge = recipe.isVegetarian 
    ? '<span class="veg-badge">Veg</span>' 
    : '<span class="veg-badge non-veg-badge">Non-Veg</span>';

  const ingredientsList = recipe.ingredients
    .map(ing => `<li>${ing.name} - ${ing.quantity}</li>`)
    .join('');

  const steps = recipe.steps
    .map(step => `<li>${step}</li>`)
    .join('');

  card.innerHTML = `
    <div class="recipe-header">
      <h3>${recipe.title}</h3>
      ${vegBadge}
    </div>
    <div class="recipe-meta">
      <span>🌍 ${recipe.cuisine}</span>
      <span>⏱️ ${recipe.cookTime || 20} min</span>
      <span class="stat-badge stat-calories">🔥 ${recipe.approxCalories || 300} cal</span>
      <span class="stat-badge stat-protein">💪 ${recipe.protein || 0} g</span>
    </div>
    <div class="recipe-content">
      <div class="recipe-section">
        <h4>Ingredients</h4>
        <ul>${ingredientsList}</ul>
      </div>
      <div class="recipe-section">
        <h4>Steps</h4>
        <ol>${steps}</ol>
      </div>
    </div>
    <button class="btn btn-secondary add-to-planner" data-recipe='${JSON.stringify(recipe)}'>
      + Add to Meal Planner
    </button>
  `;

  card.querySelector('.add-to-planner').addEventListener('click', (e) => {
    let recipe = {};
    try {
      // use currentTarget to ensure we read the button element even if inner node was clicked
      recipe = JSON.parse(e.currentTarget.dataset.recipe);
    } catch (err) {
      console.error('Failed to parse recipe data attribute', err);
      return;
    }
    // clear any explicit meal target so user is prompted to choose meal
    app.currentMealToAdd = null;
    recipe.source = recipe.source || 'cookbook';
    // store pending recipe and show the meal selection UI immediately
    app._pendingMealRecipe = recipe;
    showMealSelectionModal(recipe);
  });

  return card;
}

// ============ RECIPE GENERATOR FUNCTIONS ============
async function generateRecipe(e) {
  e.preventDefault();

  // Read selected cuisine and ingredients
  const cuisine = document.getElementById('gen-cuisine').value;
  const ingredientsInput = document.getElementById('gen-ingredients').value;
  const ingredients = ingredientsInput.split(',').map(i => i.trim()).filter(i => i);

  // Basic validation: cuisine must be selected
  document.getElementById('generator-error').textContent = '';
  if (!cuisine) {
    document.getElementById('generator-error').textContent = 'Please select a cuisine to generate a recipe.';
    return;
  }

  document.getElementById('generator-loading').style.display = 'block';
  document.getElementById('generated-recipe').style.display = 'none';

  // Call server-side AI generator only. Do NOT fall back to static cookbook for generated recipes.
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuisine, vegOnly: app.vegOnly, ingredients })
    });

    if (!response.ok) {
      let err = 'AI generation failed';
      try {
        const json = await response.json();
        err = json.error || err;
      } catch (e) {}
      document.getElementById('generator-error').textContent = err;
      return;
    }

    const recipe = await response.json();

    // Validate AI response strictly: must include title, cuisine, ingredients array, and steps array
    if (!recipe || !recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
      document.getElementById('generator-error').textContent = 'AI returned invalid recipe format.';
      return;
    }

    app.generatedRecipe = recipe;
    displayGeneratedRecipe(recipe);
  } catch (error) {
    document.getElementById('generator-error').textContent = 'AI recipe generation failed: ' + (error && error.message ? error.message : 'network error');
  } finally {
    document.getElementById('generator-loading').style.display = 'none';
  }
}

function displayGeneratedRecipe(recipe) {
  document.getElementById('gen-recipe-title').textContent = recipe.title;
  document.getElementById('gen-recipe-veg').textContent = recipe.isVegetarian ? 'Veg' : 'Non-Veg';
  document.getElementById('gen-recipe-veg').className = recipe.isVegetarian 
    ? 'veg-badge' 
    : 'veg-badge non-veg-badge';
  document.getElementById('gen-recipe-region').textContent = `🌍 ${recipe.cuisine}`;
  document.getElementById('gen-recipe-time').textContent = `⏱️ ${recipe.cookTime || 20} min`;
  document.getElementById('gen-recipe-calories').textContent = `${recipe.approxCalories || 300}`;
  document.getElementById('gen-recipe-protein').textContent = `${recipe.protein || 0}`;

  const ingredientsList = document.getElementById('gen-recipe-ingredients');
  ingredientsList.innerHTML = recipe.ingredients
    .map(ing => `<li>${ing.name} - ${ing.quantity}</li>`)
    .join('');

  const steps = document.getElementById('gen-recipe-steps');
  steps.innerHTML = recipe.steps
    .map(step => `<li>${step}</li>`)
    .join('');

  document.getElementById('generated-recipe').style.display = 'block';
}

function addGeneratedRecipeToPlanner() {
  if (!app.generatedRecipe) return;
  // Open meal selection instantly for generated recipe
  const copy = Object.assign({}, app.generatedRecipe, { source: 'ai' });
  app._pendingMealRecipe = copy;
  showMealSelectionModal(copy);
}

// ============ MEAL PLANNER FUNCTIONS ============
function updatePlanDateDisplay() {
  const dateInput = document.getElementById('plan-date').value;
  const date = new Date(dateInput + 'T00:00:00');
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('plan-date-display').textContent = date.toLocaleDateString('en-US', options);
}

function showRecipeModal(mealType, recipes = null) {
  const modal = document.getElementById('recipe-modal');
  const modalList = document.getElementById('modal-recipes-list');
  const modalTitle = document.getElementById('modal-title');
  const mealSelection = document.getElementById('meal-selection-content');

  if (mealType) {
    app.currentMealToAdd = mealType; // ensure mealType is globally known for direct-add flow
    modalTitle.textContent = `Select Recipe for ${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
  } else {
    app.currentMealToAdd = null;
  }

  // Show modal immediately to avoid any perceived delay
  modal.style.display = 'flex';

  // Populate content after making modal visible so open feels instantaneous
  if (recipes) {
    // Show specific recipes (e.g., from cookbook or generated)
    if (mealSelection) mealSelection.style.display = 'none';
    modalList.style.display = 'grid';
    modalList.innerHTML = recipes.map(recipe => `
      <div class="recipe-option" data-recipe='${JSON.stringify(recipe)}'>
        <h4>${recipe.title}</h4>
        <p>🔥 ${recipe.approxCalories || 300} cal • 💪 ${recipe.protein || 0} g</p>
        <p>${recipe.isVegetarian ? '🥗 Vegetarian' : '🍗 Non-Veg'}</p>
      </div>
    `).join('');
  } else {
    // Show all recipes from cookbook
    if (mealSelection) mealSelection.style.display = 'none';
    modalList.style.display = 'grid';
    // Populate immediately so clicks work without delay
    modalList.innerHTML = app.recipes.map(recipe => `
      <div class="recipe-option" data-recipe='${JSON.stringify(recipe)}'>
        <h4>${recipe.title}</h4>
        <p>🔥 ${recipe.approxCalories || 300} cal • 💪 ${recipe.protein || 0} g</p>
        <p>${recipe.isVegetarian ? '🥗 Vegetarian' : '🍗 Non-Veg'}</p>
      </div>
    `).join('');
  }
}

function closeRecipeModal() {
  document.getElementById('recipe-modal').style.display = 'none';
  app.currentMealToAdd = null;
  // Reset pending selection and UI state
  app._pendingMealRecipe = null;
  const mealSelection = document.getElementById('meal-selection-content');
  const modalList = document.getElementById('modal-recipes-list');
  if (mealSelection) mealSelection.style.display = 'none';
  if (modalList) modalList.style.display = 'grid';
}

function selectRecipeForMeal(element) {
  if (app._selectionInProgress) return;
  app._selectionInProgress = true;
  let recipe = {};
  try {
    recipe = JSON.parse(element.dataset.recipe);
  } catch (err) {
    console.error('Invalid recipe option payload', err);
    app._selectionInProgress = false;
    return;
  }

  const mealType = app.currentMealToAdd;
  if (!mealType) {
    // user must pick a meal type after selecting a recipe
    recipe.source = recipe.source || 'cookbook';
    showMealSelectionModal(recipe);
    app._selectionInProgress = false;
    return;
  }

  // add and let addRecipeToMeal handle UI updates and modal closing
  addRecipeToMeal(recipe, mealType, recipe.source || 'cookbook');
  app._selectionInProgress = false;
}

function showMealSelectionModal(recipe) {
  const modal = document.getElementById('recipe-modal');
  const modalList = document.getElementById('modal-recipes-list');
  const modalTitle = document.getElementById('modal-title');
  const mealSelection = document.getElementById('meal-selection-content');

  // Store pending recipe for the delegated meal button handler to use
  app._pendingMealRecipe = recipe;

  modalTitle.textContent = 'Select Meal Type';
  // Hide recipe list (if any) and show pre-rendered meal selection
  if (modalList) modalList.style.display = 'none';
  if (mealSelection) mealSelection.style.display = 'grid';
  modal.style.display = 'flex';
}

function removeMealItem(button) {
  const itemId = parseInt(button.dataset.id);
  const mealType = button.dataset.meal;

  app.mealPlan[mealType] = app.mealPlan[mealType].filter(item => item.id !== itemId);
  updateMealDisplay(mealType);
  updateCalorieTracker();
}

function updateMealDisplay(mealType) {
  const container = document.getElementById(mealType + '-items');
  const items = app.mealPlan[mealType];

  if (items.length === 0) {
    container.innerHTML = '<p style="color: #999;">No meals added</p>';
    return;
  }

  // Render each meal item with both calories and protein shown clearly
  container.innerHTML = items.map(item => `
    <div class="meal-item">
      <div class="meal-item-info">
        <h4>${item.title}</h4>
        <div class="meal-stats">
          <span class="stat-badge stat-calories">🔥 ${item.approxCalories || 300} cal</span>
          <span class="stat-badge stat-protein">💪 ${item.protein || 0} g</span>
        </div>
      </div>
      <button class="meal-item-remove" data-id="${item.id}" data-meal="${mealType}">Remove</button>
    </div>
  `).join('');

  // Remove-button clicks are handled by delegated listener in `setupEventListeners()`
  // Avoid adding per-render listeners to prevent duplicates and accidental multiple removals
}

function updateCalorieTracker() {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  let totalCalories = 0;
  let totalProtein = 0;

  mealTypes.forEach(mealType => {
    const calories = app.mealPlan[mealType].reduce((sum, item) => sum + (item.approxCalories || 0), 0);
    const protein = app.mealPlan[mealType].reduce((sum, item) => sum + (item.protein || 0), 0);

    // update per-meal displays
    const calEl = document.getElementById(mealType + '-calories');
    const protEl = document.getElementById(mealType + '-protein');
    if (calEl) calEl.textContent = calories;
    if (protEl) protEl.textContent = protein;

    totalCalories += calories;
    totalProtein += protein;
  });

  // update totals
  const totalCalEl = document.getElementById('total-calories');
  const totalProtEl = document.getElementById('total-protein');
  if (totalCalEl) totalCalEl.textContent = totalCalories;
  if (totalProtEl) totalProtEl.textContent = totalProtein;
}

async function saveMealPlan() {
  const planDate = app.currentPlanDate;

  try {
    // compute totals to include in payload (ensure backend can persist totals)
    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
    let totalCalories = 0;
    let totalProtein = 0;
    mealTypes.forEach(mealType => {
      totalCalories += app.mealPlan[mealType].reduce((s, it) => s + (it.approxCalories || 0), 0);
      totalProtein += app.mealPlan[mealType].reduce((s, it) => s + (it.protein || 0), 0);
    });

    const mealDataToSave = Object.assign({}, app.mealPlan, { totalCalories, totalProtein });

    const response = await fetch('/api/meal-plans/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planDate, mealData: mealDataToSave })
    });

    const json = await response.json().catch(() => null);
    if (response.ok) {
      alert('Meal plan saved successfully!');
    } else if (json && json.error) {
      alert('Failed to save meal plan: ' + json.error);
    } else {
      alert('Failed to save meal plan');
    }
  } catch (error) {
    alert('Error saving meal plan: ' + (error && error.message ? error.message : 'network error'));
  }
}

async function loadMealPlan() {
  const planDate = app.currentPlanDate;

  try {
    const response = await fetch(`/api/meal-plans/${planDate}`);
    const data = await response.json();

    if (data) {
      app.mealPlan = data;
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mealType => {
        updateMealDisplay(mealType);
      });
      updateCalorieTracker();
      alert('Meal plan loaded successfully!');
    } else {
      alert('No saved meal plan for this date');
    }
  } catch (error) {
    alert('Error loading meal plan: ' + error.message);
  }
}

// Initialize function (idempotent) to avoid duplicate listeners and reference errors
function initializeApp() {
  if (initializeApp._initialized) return;
  try {
    setupEventListeners();
    showMainApp();
    loadCookbook();
    initializeApp._initialized = true;
  } catch (err) {
    console.error('Initialization error:', err);
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
