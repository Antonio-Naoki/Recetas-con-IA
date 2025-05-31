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
      const ingredientNames = preferences?.ingredientNames || [];
      
      if (!ingredientNames || !Array.isArray(ingredientNames) || ingredientNames.length === 0) {
        return res.status(400).json({ error: "No ingredients provided" });
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const ingredientList = ingredientNames.join(', ');

      const prompt = `Crea una receta DETALLADA usando estos ingredientes: ${ingredientList}

Preferencias:
- Tipo de comida: ${preferences?.mealType || 'cena'}
- Porciones: ${preferences?.servings || 4} personas
- Tiempo de cocción: ${preferences?.cookingTime || '30 minutos'}
- Dificultad: ${preferences?.difficulty || 'fácil'}
- Restricciones dietéticas: ${preferences?.dietaryRestrictions?.join(', ') || 'ninguna'}

Por favor proporciona una respuesta JSON con exactamente esta estructura:
{
  "title": "Nombre completo de la receta en español",
  "description": "Descripción detallada de la receta, sus sabores y características",
  "cookingTime": 45,
  "servings": ${preferences?.servings || 4},
  "difficulty": "fácil",
  "ingredients": [
    {"name": "Pollo (pechuga)", "amount": "800 gramos", "available": true},
    {"name": "Cebolla blanca", "amount": "2 unidades medianas", "available": true},
    {"name": "Sal", "amount": "1 cucharadita", "available": false}
  ],
  "instructions": [
    {"step": 1, "instruction": "Lavar y secar las pechugas de pollo. Cortarlas en cubos de 3cm aproximadamente. Sazonar con sal y pimienta al gusto.", "time": 8},
    {"step": 2, "instruction": "Pelar y picar finamente las cebollas en cubos pequeños de 1cm. Calentar 2 cucharadas de aceite en una sartén grande a fuego medio-alto.", "time": 5}
  ],
  "dietaryTags": ["sin gluten", "alto en proteínas"],
  "tips": "Para obtener mejor sabor, marina el pollo 30 minutos antes de cocinar. Sirve caliente acompañado de arroz blanco o puré de papas."
}

INSTRUCCIONES ESPECÍFICAS:
- Cantidades EXACTAS: Especifica gramos, unidades, cucharadas, tazas, etc.
- Pasos DETALLADOS: Incluye técnicas de cocción, tiempos específicos, temperaturas
- Tamaños de corte: Especifica cómo cortar (cubos, juliana, rodajas, etc.)
- Técnicas culinarias: Menciona sofrito, sellado, cocción a fuego lento, etc.
- Puntos de cocción: Cuando esté dorado, transparente, al dente, etc.
- Condimentos básicos: Incluye sal, pimienta, aceite como "available": false
- Para ${preferences?.servings || 4} personas exactamente
- Tiempo total realista considerando preparación y cocción
- Responde TODO en español con vocabulario culinario preciso`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No JSON found in response");
        }
        
        const recipeData = JSON.parse(jsonMatch[0]);
        
        // Save the recipe
        const recipe = await storage.createRecipe({
          title: recipeData.title,
          description: recipeData.description,
          cookingTime: recipeData.cookingTime,
          servings: recipeData.servings,
          difficulty: recipeData.difficulty,
          ingredients: recipeData.ingredients,
          instructions: recipeData.instructions,
          dietaryTags: recipeData.dietaryTags,
          imageUrl: null,
        });
        
        res.json(recipe);
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        res.status(500).json({ 
          error: "Failed to parse recipe response",
          details: text.substring(0, 200) + "..."
        });
      }
    } catch (error) {
      console.error("Recipe generation error:", error);
      res.status(500).json({ 
        error: "Failed to generate recipe",
        details: error.message 
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
