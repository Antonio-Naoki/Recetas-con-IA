import type { Recipe } from "@shared/schema";

interface NutritionalDatabase {
  [key: string]: {
    caloriesPerGram: number;
    proteinPerGram: number;
    carbsPerGram: number;
    fatPerGram: number;
    fiberPerGram: number;
    vitamins: string[];
    minerals: string[];
  };
}

// Nutritional database with common ingredients (per gram)
const NUTRITION_DB: NutritionalDatabase = {
  // Proteins
  "pollo": { caloriesPerGram: 2.39, proteinPerGram: 0.27, carbsPerGram: 0, fatPerGram: 0.14, fiberPerGram: 0, vitamins: ["Niacina", "Vitamina B6"], minerals: ["Fósforo", "Selenio"] },
  "pechuga de pollo": { caloriesPerGram: 1.65, proteinPerGram: 0.31, carbsPerGram: 0, fatPerGram: 0.036, fiberPerGram: 0, vitamins: ["Niacina", "Vitamina B6"], minerals: ["Fósforo", "Selenio"] },
  "carne de res": { caloriesPerGram: 2.5, proteinPerGram: 0.26, carbsPerGram: 0, fatPerGram: 0.17, fiberPerGram: 0, vitamins: ["Vitamina B12", "Zinc"], minerals: ["Hierro", "Zinc"] },
  "salmón": { caloriesPerGram: 2.08, proteinPerGram: 0.25, carbsPerGram: 0, fatPerGram: 0.12, fiberPerGram: 0, vitamins: ["Vitamina D", "Vitamina B12"], minerals: ["Selenio", "Fósforo"] },
  "huevo": { caloriesPerGram: 1.55, proteinPerGram: 0.13, carbsPerGram: 0.011, fatPerGram: 0.11, fiberPerGram: 0, vitamins: ["Vitamina B12", "Colina"], minerals: ["Selenio", "Fósforo"] },
  "huevos": { caloriesPerGram: 1.55, proteinPerGram: 0.13, carbsPerGram: 0.011, fatPerGram: 0.11, fiberPerGram: 0, vitamins: ["Vitamina B12", "Colina"], minerals: ["Selenio", "Fósforo"] },
  "atún": { caloriesPerGram: 1.32, proteinPerGram: 0.28, carbsPerGram: 0, fatPerGram: 0.01, fiberPerGram: 0, vitamins: ["Vitamina B12", "Niacina"], minerals: ["Selenio", "Fósforo"] },
  
  // Carbohidratos
  "arroz": { caloriesPerGram: 3.65, proteinPerGram: 0.071, carbsPerGram: 0.8, fatPerGram: 0.007, fiberPerGram: 0.013, vitamins: ["Tiamina", "Niacina"], minerals: ["Manganeso", "Selenio"] },
  "pasta": { caloriesPerGram: 3.71, proteinPerGram: 0.13, carbsPerGram: 0.75, fatPerGram: 0.011, fiberPerGram: 0.025, vitamins: ["Folato", "Tiamina"], minerals: ["Manganeso", "Selenio"] },
  "pan": { caloriesPerGram: 2.65, proteinPerGram: 0.09, carbsPerGram: 0.49, fatPerGram: 0.032, fiberPerGram: 0.024, vitamins: ["Tiamina", "Folato"], minerals: ["Hierro", "Magnesio"] },
  "papa": { caloriesPerGram: 0.77, proteinPerGram: 0.02, carbsPerGram: 0.17, fatPerGram: 0.001, fiberPerGram: 0.022, vitamins: ["Vitamina C", "Vitamina B6"], minerals: ["Potasio", "Manganeso"] },
  "patata": { caloriesPerGram: 0.77, proteinPerGram: 0.02, carbsPerGram: 0.17, fatPerGram: 0.001, fiberPerGram: 0.022, vitamins: ["Vitamina C", "Vitamina B6"], minerals: ["Potasio", "Manganeso"] },
  "quinoa": { caloriesPerGram: 3.68, proteinPerGram: 0.146, carbsPerGram: 0.64, fatPerGram: 0.062, fiberPerGram: 0.07, vitamins: ["Folato", "Tiamina"], minerals: ["Manganeso", "Fósforo"] },
  
  // Vegetales
  "tomate": { caloriesPerGram: 0.18, proteinPerGram: 0.009, carbsPerGram: 0.039, fatPerGram: 0.002, fiberPerGram: 0.012, vitamins: ["Vitamina C", "Licopeno"], minerals: ["Potasio", "Folato"] },
  "cebolla": { caloriesPerGram: 0.4, proteinPerGram: 0.011, carbsPerGram: 0.093, fatPerGram: 0.001, fiberPerGram: 0.017, vitamins: ["Vitamina C", "Folato"], minerals: ["Potasio", "Manganeso"] },
  "ajo": { caloriesPerGram: 1.49, proteinPerGram: 0.064, carbsPerGram: 0.33, fatPerGram: 0.005, fiberPerGram: 0.021, vitamins: ["Vitamina C", "Vitamina B6"], minerals: ["Manganeso", "Selenio"] },
  "zanahoria": { caloriesPerGram: 0.41, proteinPerGram: 0.009, carbsPerGram: 0.096, fatPerGram: 0.002, fiberPerGram: 0.028, vitamins: ["Vitamina A", "Vitamina K"], minerals: ["Potasio", "Molibdeno"] },
  "brócoli": { caloriesPerGram: 0.34, proteinPerGram: 0.028, carbsPerGram: 0.069, fatPerGram: 0.004, fiberPerGram: 0.026, vitamins: ["Vitamina C", "Vitamina K"], minerals: ["Folato", "Potasio"] },
  "espinaca": { caloriesPerGram: 0.23, proteinPerGram: 0.029, carbsPerGram: 0.036, fatPerGram: 0.004, fiberPerGram: 0.022, vitamins: ["Vitamina K", "Folato"], minerals: ["Hierro", "Magnesio"] },
  "pimiento": { caloriesPerGram: 0.31, proteinPerGram: 0.01, carbsPerGram: 0.072, fatPerGram: 0.003, fiberPerGram: 0.025, vitamins: ["Vitamina C", "Vitamina A"], minerals: ["Potasio", "Folato"] },
  
  // Frutas
  "manzana": { caloriesPerGram: 0.52, proteinPerGram: 0.003, carbsPerGram: 0.138, fatPerGram: 0.002, fiberPerGram: 0.024, vitamins: ["Vitamina C", "Vitamina K"], minerals: ["Potasio", "Manganeso"] },
  "plátano": { caloriesPerGram: 0.89, proteinPerGram: 0.011, carbsPerGram: 0.229, fatPerGram: 0.003, fiberPerGram: 0.026, vitamins: ["Vitamina B6", "Vitamina C"], minerals: ["Potasio", "Manganeso"] },
  "limón": { caloriesPerGram: 0.29, proteinPerGram: 0.011, carbsPerGram: 0.092, fatPerGram: 0.002, fiberPerGram: 0.047, vitamins: ["Vitamina C", "Citrato"], minerals: ["Potasio", "Folato"] },
  
  // Grasas y aceites
  "aceite de oliva": { caloriesPerGram: 8.84, proteinPerGram: 0, carbsPerGram: 0, fatPerGram: 1, fiberPerGram: 0, vitamins: ["Vitamina E", "Vitamina K"], minerals: [] },
  "mantequilla": { caloriesPerGram: 7.17, proteinPerGram: 0.009, carbsPerGram: 0.006, fatPerGram: 0.81, fiberPerGram: 0, vitamins: ["Vitamina A", "Vitamina E"], minerals: [] },
  "aguacate": { caloriesPerGram: 1.6, proteinPerGram: 0.02, carbsPerGram: 0.085, fatPerGram: 0.147, fiberPerGram: 0.067, vitamins: ["Vitamina K", "Folato"], minerals: ["Potasio", "Magnesio"] },
  
  // Lácteos
  "leche": { caloriesPerGram: 0.42, proteinPerGram: 0.034, carbsPerGram: 0.048, fatPerGram: 0.01, fiberPerGram: 0, vitamins: ["Vitamina B12", "Riboflavina"], minerals: ["Calcio", "Fósforo"] },
  "queso": { caloriesPerGram: 4.02, proteinPerGram: 0.25, carbsPerGram: 0.013, fatPerGram: 0.333, fiberPerGram: 0, vitamins: ["Vitamina B12", "Vitamina A"], minerals: ["Calcio", "Fósforo"] },
  "yogur": { caloriesPerGram: 0.59, proteinPerGram: 0.1, carbsPerGram: 0.046, fatPerGram: 0.004, fiberPerGram: 0, vitamins: ["Vitamina B12", "Riboflavina"], minerals: ["Calcio", "Fósforo"] },
  
  // Legumbres
  "frijoles": { caloriesPerGram: 3.47, proteinPerGram: 0.217, carbsPerGram: 0.627, fatPerGram: 0.014, fiberPerGram: 0.151, vitamins: ["Folato", "Tiamina"], minerals: ["Hierro", "Magnesio"] },
  "lentejas": { caloriesPerGram: 3.53, proteinPerGram: 0.244, carbsPerGram: 0.636, fatPerGram: 0.011, fiberPerGram: 0.108, vitamins: ["Folato", "Tiamina"], minerals: ["Hierro", "Fósforo"] },
  "garbanzos": { caloriesPerGram: 3.78, proteinPerGram: 0.197, carbsPerGram: 0.682, fatPerGram: 0.061, fiberPerGram: 0.123, vitamins: ["Folato", "Tiamina"], minerals: ["Manganeso", "Fósforo"] },
  
  // Frutos secos
  "almendras": { caloriesPerGram: 5.79, proteinPerGram: 0.211, carbsPerGram: 0.218, fatPerGram: 0.497, fiberPerGram: 0.125, vitamins: ["Vitamina E", "Riboflavina"], minerals: ["Magnesio", "Manganeso"] },
  "nueces": { caloriesPerGram: 6.54, proteinPerGram: 0.152, carbsPerGram: 0.137, fatPerGram: 0.654, fiberPerGram: 0.067, vitamins: ["Vitamina E", "Folato"], minerals: ["Manganeso", "Cobre"] },
};

// Extract nutritional value from ingredient amount string
function parseIngredientAmount(amount: string): number {
  const numbers = amount.match(/\d+/g);
  if (!numbers) return 100; // Default to 100g if no number found
  
  const value = parseInt(numbers[0]);
  
  // Convert common units to grams
  if (amount.toLowerCase().includes('kg')) return value * 1000;
  if (amount.toLowerCase().includes('libra')) return value * 453.592;
  if (amount.toLowerCase().includes('onza')) return value * 28.3495;
  if (amount.toLowerCase().includes('taza')) return value * 240; // Approximate for liquid
  if (amount.toLowerCase().includes('cucharada')) return value * 15;
  if (amount.toLowerCase().includes('cucharadita')) return value * 5;
  if (amount.toLowerCase().includes('ml') || amount.toLowerCase().includes('cc')) return value; // Assume density ~1
  if (amount.toLowerCase().includes('l') || amount.toLowerCase().includes('litro')) return value * 1000;
  
  return value; // Assume grams if no unit specified
}

// Find matching ingredient in database
function findIngredientMatch(ingredientName: string): string | null {
  const name = ingredientName.toLowerCase();
  
  // Direct match
  if (NUTRITION_DB[name]) return name;
  
  // Partial match
  for (const dbIngredient of Object.keys(NUTRITION_DB)) {
    if (name.includes(dbIngredient) || dbIngredient.includes(name)) {
      return dbIngredient;
    }
  }
  
  return null;
}

// Calculate nutritional information for a recipe
export function calculateNutritionalInfo(recipe: any): any {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let totalFiber = 0;
  const vitamins = new Set<string>();
  const minerals = new Set<string>();
  
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    for (const ingredient of recipe.ingredients) {
      const ingredientMatch = findIngredientMatch(ingredient.name || ingredient);
      
      if (ingredientMatch) {
        const nutritionData = NUTRITION_DB[ingredientMatch];
        const grams = parseIngredientAmount(ingredient.amount || '100g');
        
        totalCalories += nutritionData.caloriesPerGram * grams;
        totalProtein += nutritionData.proteinPerGram * grams;
        totalCarbs += nutritionData.carbsPerGram * grams;
        totalFat += nutritionData.fatPerGram * grams;
        totalFiber += nutritionData.fiberPerGram * grams;
        
        // Add vitamins and minerals
        nutritionData.vitamins.forEach(v => vitamins.add(v));
        nutritionData.minerals.forEach(m => minerals.add(m));
      }
    }
  }
  
  // Calculate per serving
  const servings = recipe.servings || 4;
  
  return {
    calories: Math.round(totalCalories / servings),
    protein: Math.round(totalProtein / servings),
    carbs: Math.round(totalCarbs / servings),
    fat: Math.round(totalFat / servings),
    fiber: Math.round(totalFiber / servings),
    vitamins: Array.from(vitamins).slice(0, 3), // Top 3 vitamins
    minerals: Array.from(minerals).slice(0, 3), // Top 3 minerals
  };
}

// Generate health benefits based on ingredients
export function generateHealthBenefits(recipe: any): string[] {
  const benefits = new Set<string>();
  
  if (recipe.ingredients && Array.isArray(recipe.ingredients)) {
    for (const ingredient of recipe.ingredients) {
      const name = (ingredient.name || ingredient).toLowerCase();
      
      // Add benefits based on ingredients
      if (name.includes('brócoli') || name.includes('espinaca')) {
        benefits.add('Rico en antioxidantes');
        benefits.add('Fortalece el sistema inmunológico');
      }
      if (name.includes('salmón') || name.includes('atún')) {
        benefits.add('Alto en Omega-3');
        benefits.add('Beneficioso para el corazón');
      }
      if (name.includes('quinoa') || name.includes('lentejas')) {
        benefits.add('Fuente de proteína completa');
        benefits.add('Alto en fibra');
      }
      if (name.includes('aguacate')) {
        benefits.add('Grasas saludables');
        benefits.add('Beneficioso para la piel');
      }
      if (name.includes('ajo') || name.includes('cebolla')) {
        benefits.add('Propiedades antimicrobianas');
      }
      if (name.includes('tomate')) {
        benefits.add('Rico en licopeno');
      }
    }
  }
  
  // Default benefits if none found
  if (benefits.size === 0) {
    benefits.add('Nutritivo y equilibrado');
    benefits.add('Ingredientes naturales');
  }
  
  return Array.from(benefits).slice(0, 4); // Limit to 4 benefits
}

