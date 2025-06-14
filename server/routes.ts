import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { insertIngredientSchema, insertRecipeSchema, insertRecipePreferencesSchema } from "@shared/schema";
import { calculateNutritionalInfo, generateHealthBenefits } from "./nutritionService";
import { z } from "zod";

const upload = multer({ storage: multer.memoryStorage() });

// Helper functions for advanced AI prompts
function getAIPersonalityPrompt(personality: string): string {
  const personalities = {
    creative: "Eres un chef innovador y artístico. Combinas sabores de formas inesperadas, experimentas con texturas únicas y creas presentaciones visualmente impactantes. Siempre buscas la sorpresa culinaria.",
    health: "Eres un chef especializado en nutrición funcional. Cada ingrediente tiene un propósito nutricional específico. Maximizas beneficios para la salud usando técnicas que preservan nutrientes.",
    traditional: "Eres un chef maestro en técnicas clásicas. Respetas las tradiciones culinarias pero las perfeccionas. Tus recetas son atemporales y reconfortantes.",
    fusion: "Eres un chef globalizado que mezcla culturas culinarias audazmente. Combinas técnicas orientales con sabores latinos, europeos con asiáticos, creando armonías únicas.",
    quick: "Eres un chef eficiente y práctico. Optimizas cada paso para velocidad sin sacrificar sabor. Usas técnicas inteligentes y shortcuts profesionales."
  };
  return personalities[personality as keyof typeof personalities] || personalities.creative;
}

function buildAdvancedParametersPrompt(preferences: any): string {
  let prompt = `
PARÁMETROS AVANZADOS:
- Tipo de comida: ${preferences.mealType || 'cena'}
- Tiempo máximo: ${preferences.cookingTime || '30 minutos'}
- Dificultad: ${preferences.difficulty || 'fácil'}
- Porciones: ${preferences.servings || 4}
- Presupuesto: ${preferences.budget || 'medio'}
- Enfoque de salud: ${preferences.healthFocus || 'equilibrado'}
- Restricciones: ${preferences.dietaryRestrictions?.join(', ') || 'ninguna'}`;

  if (preferences.nutritionalGoals) {
    prompt += `

OBJETIVOS NUTRICIONALES ESPECÍFICOS:
- Calorías por porción: ${preferences.nutritionalGoals.calories}
- Proteína: ${preferences.nutritionalGoals.protein}g
- Carbohidratos: ${preferences.nutritionalGoals.carbs}g
- Grasa: ${preferences.nutritionalGoals.fat}g
- Fibra: ${preferences.nutritionalGoals.fiber}g`;
  }

  if (preferences.culinaryPreferences) {
    prompt += `

PREFERENCIAS CULINARIAS AVANZADAS:
- Estilos de cocina: ${preferences.culinaryPreferences.cuisineTypes?.join(', ') || 'libre'}
- Nivel de picante: ${['muy suave', 'suave', 'medio', 'picante', 'muy picante'][preferences.culinaryPreferences.spiceLevel - 1] || 'medio'}
- Métodos preferidos: ${preferences.culinaryPreferences.cookingMethods?.join(', ') || 'variados'}`;
  }

  if (preferences.sustainabilityMode) {
    prompt += `

🌱 MODO SOSTENIBILIDAD ACTIVADO:
- Prioriza ingredientes locales y de temporada
- Minimiza desperdicio alimentario (usa tallos, cáscaras, etc.)
- Técnicas de cocción eficientes energéticamente
- Reduce huella de carbono en selección de ingredientes
- Enfoque en ingredientes orgánicos y de producción local`;
  }

  return prompt;
}

function getResponseFormat(isWeeklyPlan: boolean, nutritionOptimization: boolean): string {
  if (isWeeklyPlan) {
    return `Responde únicamente con un JSON válido con esta estructura exacta para el plan semanal.`;
  }

  const baseFormat = `
{
  "title": "Nombre creativo y apetitoso",
  "description": "Descripción detallada que incluya beneficios nutricionales y experiencia gastronómica",
  "cookingTime": 30,
  "servings": 4,
  "difficulty": "fácil",
  "ingredients": [
    {
      "name": "Ingrediente específico",
      "amount": "cantidad precisa",
      "preparation": "preparación específica (picado, rallado, etc.)",
      "substitutes": ["sustituto1", "sustituto2"]
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Instrucción muy detallada con técnicas específicas",
      "time": 5,
      "temperature": "temperatura si aplica",
      "technique": "técnica culinaria específica",
      "tips": "consejo profesional"
    }
  ],
  "dietaryTags": ["tag nutricional", "tag de cocina", "tag de dificultad"],
  "cookingTips": ["consejo profesional 1", "consejo profesional 2"],
  "servingSuggestions": ["sugerencia de acompañamiento 1", "sugerencia 2"]`;

  if (nutritionOptimization) {
    return baseFormat + `,
  "nutritionalInfo": {
    "calories": "calorías estimadas por porción",
    "protein": "gramos de proteína",
    "carbs": "gramos de carbohidratos",
    "fat": "gramos de grasa",
    "fiber": "gramos de fibra",
    "vitamins": ["vitamina principal 1", "vitamina principal 2"],
    "minerals": ["mineral principal 1", "mineral principal 2"]
  },
  "healthBenefits": ["beneficio de salud 1", "beneficio de salud 2"]
}

Responde únicamente con este JSON válido.`;
  }

  return baseFormat + `
}

Responde únicamente con este JSON válido.`;
}

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
    console.log('Received advanced preferences:', preferences);

    // Initialize the model with advanced configuration
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: preferences.aiPersonality === 'creative' ? 1.2 : 0.8,
        topK: 40,
        topP: 0.95,
      }
    });

    // Handle different input formats
    let ingredientNames: string[] = [];

    if (preferences.ingredientNames && Array.isArray(preferences.ingredientNames)) {
      ingredientNames = preferences.ingredientNames;
    } else if (preferences.ingredientIds && Array.isArray(preferences.ingredientIds)) {
      ingredientNames = ['tomate', 'cebolla', 'ajo'];
    }

    // Build advanced AI prompt
    let prompt;

    if (preferences.weeklyPlan) {
      // Weekly plan generation - simplified to avoid JSON parsing issues
      prompt = `Actúa como un CHEF PROFESIONAL CON IA AVANZADA y crea una receta especial para plan semanal usando estos ingredientes: ${ingredientNames.join(', ')}.

CARACTERÍSTICAS DEL CHEF IA:
${getAIPersonalityPrompt(preferences.aiPersonality)}

INSTRUCCIONES ESPECIALES: ${preferences.specialInstructions || 'Crea una receta deliciosa que forme parte de un menú semanal variado'}

${buildAdvancedParametersPrompt(preferences)}

IMPORTANTE: Crea UNA receta excepcional que sea perfecta para el primer día de un plan semanal. Debe ser nutritiva, deliciosa y fácil de preparar.

${getResponseFormat(false, preferences.nutritionOptimization)}`;
    } else if (preferences.isVariation && preferences.originalRecipe) {
      // Variation generation with advanced features
      prompt = `Actúa como un CHEF PROFESIONAL CON IA AVANZADA y crea una variación REVOLUCIONARIA de esta receta:

RECETA ORIGINAL: "${preferences.originalRecipe.title}"
INGREDIENTES BASE: ${preferences.originalRecipe.ingredients?.join(', ') || ingredientNames.join(', ')}

PERSONALIDAD DEL CHEF IA:
${getAIPersonalityPrompt(preferences.aiPersonality)}

INSTRUCCIONES PARA VARIACIÓN AVANZADA:
${preferences.specialInstructions || 'Crea una variación que sorprenda manteniendo la esencia original'}

${buildAdvancedParametersPrompt(preferences)}

IMPORTANTE - VARIACIÓN INTELIGENTE:
- Transforma al menos 40% de los ingredientes o técnicas
- Mantén la esencia pero revolutiona la presentación
- Añade elementos sorpresa basados en tu personalidad IA
- Debe ser una receta completamente nueva e innovadora

${getResponseFormat(false, preferences.nutritionOptimization)}`;
    } else {
      // Standard advanced recipe generation
      prompt = `Actúa como un CHEF PROFESIONAL CON IA SÚPER AVANZADA y crea la RECETA PERFECTA con estos ingredientes: ${ingredientNames.join(', ')}.

PERSONALIDAD DEL CHEF IA:
${getAIPersonalityPrompt(preferences.aiPersonality)}

${buildAdvancedParametersPrompt(preferences)}

INSTRUCCIONES ESPECIALES DEL USUARIO: ${preferences.specialInstructions || 'Crea una receta excepcional'}

MISIÓN: Crea una receta que sea perfecta según todos los parámetros especificados. Debe ser innovadora, deliciosa y perfectamente equilibrada.

Incluye consejos de cocina útiles y sugerencias de presentación.

      IMPORTANTE: Siempre incluye información nutricional detallada calculando las calorías, macronutrientes (proteína, carbohidratos, grasas, fibra) por porción, así como las vitaminas principales y beneficios para la salud de los ingredientes utilizados.

      Responde ÚNICAMENTE con un objeto JSON válido, sin explicaciones adicionales.

      Preferencias del usuario:

${getResponseFormat(false, preferences.nutritionOptimization)}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the response more thoroughly
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    // Remove any comments or invalid JSON content
    text = text.replace(/\/\/.*$/gm, ''); // Remove line comments
    text = text.replace(/\/\*[\s\S]*?\*\//g, ''); // Remove block comments
    text = text.replace(/,\s*}/g, '}'); // Remove trailing commas
    text = text.replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

    console.log('Cleaned AI response:', text);

    let recipeData;
    try {
      recipeData = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed text:', text);
      
      // Fallback: create a simple recipe structure
      recipeData = {
        title: "Receta Especial con " + ingredientNames.join(', '),
        description: "Una deliciosa receta creada con los ingredientes disponibles",
        cookingTime: 30,
        servings: 4,
        difficulty: "fácil",
        ingredients: ingredientNames.map(ing => ({
          name: ing,
          amount: "100g",
          preparation: "Según necesidades"
        })),
        instructions: [
          {
            step: 1,
            instruction: "Preparar todos los ingredientes según las indicaciones",
            time: 10,
            technique: "preparación"
          }
        ],
        dietaryTags: ["casero"],
        cookingTips: ["Usar ingredientes frescos"],
        servingSuggestions: ["Servir caliente"]
      };
      
      // Calculate real nutritional information for fallback recipe too
      recipeData.nutritionalInfo = calculateNutritionalInfo(recipeData);
      recipeData.healthBenefits = generateHealthBenefits(recipeData);
    }

    // Handle weekly plan or single recipe
    if (preferences.weeklyPlan) {
      // For weekly plan, add a special tag and modify title
      const cleanedRecipe = {
        title: (recipeData.title || 'Receta sin nombre') + ' - Plan Semanal Día 1',
        description: (recipeData.description || 'Deliciosa receta casera') + ' (Parte de un plan semanal personalizado)',
        cookingTime: typeof recipeData.cookingTime === 'number' ? recipeData.cookingTime : 30,
        servings: typeof recipeData.servings === 'number' ? recipeData.servings : 4,
        difficulty: recipeData.difficulty || 'fácil',
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        dietaryTags: [...(Array.isArray(recipeData.dietaryTags) ? recipeData.dietaryTags : []), 'Plan Semanal'],
        cookingTips: Array.isArray(recipeData.cookingTips) ? recipeData.cookingTips : [],
        servingSuggestions: Array.isArray(recipeData.servingSuggestions) ? recipeData.servingSuggestions : [],
        nutritionalInfo: null, // Will be calculated below
        healthBenefits: null // Will be calculated below
      };
      
      // Calculate real nutritional information based on ingredients
      cleanedRecipe.nutritionalInfo = calculateNutritionalInfo(cleanedRecipe);
      cleanedRecipe.healthBenefits = generateHealthBenefits(cleanedRecipe);

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
        cookingTips: cleanedRecipe.cookingTips,
        servingSuggestions: cleanedRecipe.servingSuggestions,
        nutritionalInfo: cleanedRecipe.nutritionalInfo,
        healthBenefits: cleanedRecipe.healthBenefits
      });

      console.log('Generated weekly plan recipe:', cleanedRecipe);
      res.json(newRecipe);
    } else {
      // Regular single recipe handling
      const cleanedRecipe = {
        title: recipeData.title || 'Receta sin nombre',
        description: recipeData.description || 'Deliciosa receta casera',
        cookingTime: typeof recipeData.cookingTime === 'number' ? recipeData.cookingTime : 30,
        servings: typeof recipeData.servings === 'number' ? recipeData.servings : 4,
        difficulty: recipeData.difficulty || 'fácil',
        ingredients: Array.isArray(recipeData.ingredients) ? recipeData.ingredients : [],
        instructions: Array.isArray(recipeData.instructions) ? recipeData.instructions : [],
        dietaryTags: Array.isArray(recipeData.dietaryTags) ? recipeData.dietaryTags : [],
        cookingTips: Array.isArray(recipeData.cookingTips) ? recipeData.cookingTips : [],
        servingSuggestions: Array.isArray(recipeData.servingSuggestions) ? recipeData.servingSuggestions : [],
        nutritionalInfo: null, // Will be calculated below
        healthBenefits: null // Will be calculated below
      };
      
      // Calculate real nutritional information based on ingredients
      cleanedRecipe.nutritionalInfo = calculateNutritionalInfo(cleanedRecipe);
      cleanedRecipe.healthBenefits = generateHealthBenefits(cleanedRecipe);

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
        cookingTips: cleanedRecipe.cookingTips,
        servingSuggestions: cleanedRecipe.servingSuggestions,
        nutritionalInfo: cleanedRecipe.nutritionalInfo,
        healthBenefits: cleanedRecipe.healthBenefits
      });

      console.log('Generated recipe:', cleanedRecipe);
      res.json(newRecipe);
    }
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