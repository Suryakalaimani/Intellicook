const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Initialize client lazily to avoid throwing on import when key missing
let client = null;
function getClient() {
  if (!client) client = new GoogleGenerativeAI(GEMINI_API_KEY);
  return client;
}

/**
 * Build a strict prompt that instructs the model to return ONLY JSON.
 * The JSON structure mirrors the frontend expectations.
 */
async function generateRecipe(cuisine, vegOnly, ingredients = []) {
  if (!GEMINI_API_KEY) {
    throw new Error('AI API key is not configured on the server');
  }

  try {
    // Use the user's provided InteliCook prompt as the instruction body, injected with the chosen cuisine and ingredients.
    const userPrompt = `
1. Use AI API for Recipe Generation (Core Requirement)

This prompt is for the InteliCook – AI Recipe Generator project.

An AI API key is already integrated in the InteliCook codebase.

Use the API key properly to generate recipes dynamically.

Do NOT select, reuse, or modify recipes from static Cook Book data.

The Recipe Generator module of InteliCook must rely entirely on AI-generated content.

2. Inputs for Recipe Generation (InteliCook)

Generate the recipe based on:

Selected Cuisine (${cuisine})

User-entered Ingredients (${ingredients.length > 0 ? ingredients.join(', ') : 'none'})

The generated recipe must strictly respect both the selected cuisine and the user ingredients.

3. Strict Cuisine-Specific Generation

The recipe must strictly follow the selected cuisine style.

Do NOT mix cuisines or generate generic recipes.

Examples:

South Indian → appam/dosa-style batter, coconut, pan or steam cooking

Italian → pasta, olive oil, cheese, herbs

Chinese → soy sauce, garlic, stir-fry techniques

Japanese → rice, miso, seaweed, light seasoning

Dessert → sweet ingredients and dessert-style preparation

If ingredients are unusual, adapt them creatively without changing the cuisine identity.

4. Ingredient-Based Logic

Primarily use user-provided ingredients.

You may add only basic supporting items (salt, oil, water, common spices).

Do NOT introduce major unrelated ingredients.

5. AI-Generated Recipe Output Format (InteliCook Standard)

The AI-generated recipe must include:

Recipe Name

Cuisine

Veg / Non-Veg

Estimated Calories (cal)

Estimated Protein (g)

Ingredients List

Step-by-Step Cooking Instructions

Follow this format strictly. Do not include extra explanations or comments.

6. Remove Static Recipe Dependency

Static recipe data is used only in the Cook Book module of InteliCook.

The Recipe Generator module must never fetch or reuse stored recipes.

Every generated recipe must be new and AI-created.

7. Stability & Error Handling

No console errors or runtime crashes should occur.

Handle API issues gracefully (invalid key, network failure).

Show user-friendly error messages only when required.

8. Final Instruction

Generate a new, original, AI-based recipe for the InteliCook project using the selected cuisine and user-provided ingredients.
`;

    const outputInstructions = `RETURN ONLY valid JSON with these exact keys and no extra text or commentary:
{
  "title": "Recipe Name",
  "cuisine": "${cuisine}",
  "isVegetarian": ${vegOnly},
  "approxCalories": 0,
  "protein": 0,
  "ingredients": [ { "name": "ingredient name", "quantity": "amount" } ],
  "steps": [ "Step 1", "Step 2", "Step 3" ]
}
Ensure calories and protein are integer numbers. Do NOT include any fields beyond these keys.`;

    const prompt = userPrompt + "\n\n" + outputInstructions;

    const client = getClient();
    const model = client.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);

    // Support both response.text() and result.outputText-like shapes
    let responseText = '';
    if (result && typeof result.response?.text === 'function') {
      responseText = result.response.text();
    } else if (result && result.outputText) {
      responseText = result.outputText;
    } else if (typeof result === 'string') {
      responseText = result;
    }

    // Try to extract JSON substring
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid AI response: no JSON detected');
    }

    let recipe = JSON.parse(jsonMatch[0]);

    // Basic validation and normalization
    if (!recipe.title || !Array.isArray(recipe.ingredients) || !Array.isArray(recipe.steps)) {
      throw new Error('AI returned malformed recipe JSON');
    }

    // Ensure numeric fields
    recipe.approxCalories = parseInt(recipe.approxCalories, 10) || 0;
    recipe.protein = parseInt(recipe.protein, 10) || 0;
    recipe.cuisine = recipe.cuisine || cuisine;
    recipe.isVegetarian = !!recipe.isVegetarian;

    return recipe;
  } catch (error) {
    console.error('Gemini API Error:', error && error.message ? error.message : error);
    throw new Error('Failed to generate recipe: ' + (error.message || 'unknown'));
  }
}

module.exports = {
  generateRecipe
};
