import { apiRequest } from "./queryClient";

export interface RecognizedIngredient {
  name: string;
  quantity: string;
  confidence: 'high' | 'medium' | 'low';
}

export interface RecipePreferences {
  mealType: string;
  cookingTime: string;
  difficulty: string;
  dietaryRestrictions: string[];
}

export async function recognizeIngredientsFromImage(file: File): Promise<RecognizedIngredient[]> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiRequest('POST', '/api/ingredients/recognize', formData);
  const data = await response.json();
  
  if (!data.ingredients) {
    throw new Error('No ingredients recognized in the image');
  }
  
  return data.ingredients;
}

export async function generateRecipeWithAI(
  ingredientIds: number[], 
  preferences: RecipePreferences
) {
  const response = await apiRequest('POST', '/api/recipes/generate', {
    ingredientIds,
    preferences
  });
  
  return await response.json();
}
