import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { insertIngredientSchema, insertRecipeSchema, insertRecipePreferencesSchema } from "@shared/schema";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Gemini AI
  const genAI = new GoogleGenerativeAI(
    process.env.GEMINI_API_KEY || 
    process.env.GOOGLE_AI_API_KEY || 
    "AIzaSyAkc2dK7ot0Jwl0JCC1m5sEy0vrrj9ldpA"
  );

  // Ingredients routes
  app.get("/api/ingredients", async (req, res) => {
    try {
      const ingredients = await storage.getIngredients();
      res.json(ingredients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ingredients" });
    }
  });

  app.post("/api/ingredients", async (req, res) => {
    try {
      const validated = insertIngredientSchema.parse(req.body);
      const ingredient = await storage.createIngredient(validated);
      res.json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid ingredient data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create ingredient" });
      }
    }
  });

  app.put("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validated = insertIngredientSchema.partial().parse(req.body);
      const ingredient = await storage.updateIngredient(id, validated);

      if (!ingredient) {
        return res.status(404).json({ error: "Ingredient not found" });
      }

      res.json(ingredient);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid ingredient data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update ingredient" });
      }
    }
  });

  app.delete("/api/ingredients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteIngredient(id);

      if (!deleted) {
        return res.status(404).json({ error: "Ingredient not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ingredient" });
    }
  });

  // Image recognition route
  app.post("/api/ingredients/recognize", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image provided" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this image and identify all edible ingredients you can see. 
      Return a JSON array of objects with the following structure:
      [{"name": "ingredient name", "quantity": "estimated quantity", "confidence": "high/medium/low"}]

      Only include items that are clearly identifiable food ingredients. 
      Be conservative with quantities and use common kitchen measurements.
      Focus on fresh produce, dairy, proteins, and pantry items.`;

      const imagePart = {
        inlineData: {
          data: req.file.buffer.toString("base64"),
          mimeType: req.file.mimetype,
        },
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }

        const recognizedIngredients = JSON.parse(jsonMatch[0]);
        res.json({ ingredients: recognizedIngredients });
      } catch (parseError) {
        // Fallback: parse manually if JSON parsing fails
        const ingredients = [];
        const lines = text.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.includes(':') || line.includes('-')) {
            const cleaned = line.replace(/[-*]/g, '').trim();
            if (cleaned.length > 2 && !cleaned.toLowerCase().includes('ingredient')) {
              ingredients.push({
                name: cleaned.split(':')[0].trim(),
                quantity: "1 unit",
                confidence: "medium"
              });
            }
          }
        }

        res.json({ ingredients });
      }
    } catch (error) {
      console.error("Gemini API error:", error);
      res.status(500).json({ 
        error: "Failed to recognize ingredients",
        details: error.message 
      });
    }
  });

  // Recipe generation route
  app.post("/api/recipes/generate", async (req, res) => {
  try {
    const { preferences } = req.body;
    console.log('Received preferences:', preferences);

    // Handle different input formats
    let ingredientNames: string[] = [];

    if (preferences.ingredientNames && Array.isArray(preferences.ingredientNames)) {
      ingredientNames = preferences.ingredientNames;
    } else if (preferences.ingredientIds && Array.isArray(preferences.ingredientIds)) {
      // If we have ingredient IDs, we would normally fetch them from database
      // For now, we'll use some default ingredients
      ingredientNames = ['tomate', 'cebolla', 'ajo'];
    }

    // Create specialized prompt for variations
    let prompt;
    if (preferences.isVariation && preferences.originalRecipe) {
      prompt = `Genera una variación creativa de una receta existente en español:

RECETA ORIGINAL: "${preferences.originalRecipe.title}"
INGREDIENTES ORIGINALES: ${preferences.originalRecipe.ingredients?.join(', ') || ingredientNames.join(', ')}

INSTRUCCIONES PARA LA VARIACIÓN:
${preferences.specialInstructions || 'Crea una variación interesante cambiando la técnica de cocción, especias, o presentación'}

PARÁMETROS:
- Tipo de comida: ${preferences.mealType || 'cena'}
- Tiempo de cocción: ${preferences.cookingTime || '30 minutos'}
- Dificultad: ${preferences.difficulty || 'fácil'}
- Porciones: ${preferences.servings || 4}
- Restricciones dietéticas: ${preferences.dietaryRestrictions?.join(', ') || 'ninguna'}

IMPORTANTE: 
- Crea una receta DIFERENTE pero inspirada en la original
- Cambia al menos 2-3 ingredientes o la técnica de cocción
- Mantén el espíritu del plato pero hazlo único
- Debe ser una receta completamente nueva, no una copia

Responde únicamente con un JSON válido con esta estructura exacta:
{
  "title": "Nombre de la receta variada (debe ser diferente al original)",
  "description": "Descripción que mencione que es una variación creativa",
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "fácil",
  "ingredients": [
    {"name": "Ingrediente 1", "amount": "cantidad"},
    {"name": "Ingrediente 2", "amount": "cantidad"}
  ],
  "instructions": [
    {"step": 1, "instruction": "Primera instrucción", "time": 5},
    {"step": 2, "instruction": "Segunda instrucción", "time": 10}
  ],
  "dietaryTags": ["variación", "tag2"]
}`;
    } else {
      prompt = `Genera una receta en español con los siguientes parámetros:
- Ingredientes disponibles: ${ingredientNames.join(', ')}
- Tipo de comida: ${preferences.mealType || 'cena'}
- Tiempo de cocción: ${preferences.cookingTime || '30 minutos'}
- Dificultad: ${preferences.difficulty || 'fácil'}
- Porciones: ${preferences.servings || 4}
- Restricciones dietéticas: ${preferences.dietaryRestrictions?.join(', ') || 'ninguna'}

Responde únicamente con un JSON válido con esta estructura exacta:
{
  "title": "Nombre de la receta",
  "description": "Descripción breve y apetitosa",
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "fácil",
  "ingredients": [
    {"name": "Ingrediente 1", "amount": "cantidad"},
    {"name": "Ingrediente 2", "amount": "cantidad"}
  ],
  "instructions": [
    {"step": 1, "instruction": "Primera instrucción", "time": 5},
    {"step": 2, "instruction": "Segunda instrucción", "time": 10}
  ],
  "dietaryTags": ["tag1", "tag2"]
}

Usa ingredientes comunes de cocina española y latinoamericana. Asegúrate de que sea una receta práctica y deliciosa.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the response
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    console.log('Raw AI response:', text);

    let recipeData;
    try {
      recipeData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate and clean the recipe data
    const cleanedRecipe = {
      title: recipeData.title || 'Receta sin nombre',
      description: recipeData.description || 'Deliciosa receta casera',
      cookingTime: typeof recipeData.cookingTime === 'number' ? recipeData.cookingTime : 30,
      servings: typeof recipeData.servings === 'number' ? recipeData.servings : 4,
      difficulty: recipeData.difficulty || 'fácil',
      ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
      instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
      dietaryTags: Array.isArray(recipeData.dietaryTags) ? recipeData.dietaryTags : []
    };

    // Store the recipe
    const newRecipe = await storage.createRecipe({
      title: cleanedRecipe.title,
      description: cleanedRecipe.description,
      cookingTime: cleanedRecipe.cookingTime,
      servings: cleanedRecipe.servings,
      difficulty: cleanedRecipe.difficulty,
      ingredients: cleanedRecipe.ingredients,
      instructions: cleanedRecipe.instructions,
      dietaryTags: cleanedRecipe.dietaryTags,
      imageUrl: null,
    });

    console.log('Generated recipe:', cleanedRecipe);
    res.json(newRecipe);
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ 
      error: "Failed to generate recipe",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

  // Recipes routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const recipes = await storage.getRecipes();
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipes" });
    }
  });

  app.get("/api/recipes/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const recipe = await storage.getRecipe(id);

      if (!recipe) {
        return res.status(404).json({ error: "Recipe not found" });
      }

      res.json(recipe);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch recipe" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}