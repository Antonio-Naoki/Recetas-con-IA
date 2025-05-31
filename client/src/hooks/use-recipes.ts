import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { generateRecipeWithAI, type RecipePreferences } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import type { Recipe, InsertRecipe } from "@shared/schema";

export function useRecipes() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes"],
  });

  const createRecipeMutation = useMutation({
    mutationFn: async (recipe: InsertRecipe) => {
      const response = await apiRequest("POST", "/api/recipes", recipe);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Receta guardada",
        description: "La receta se ha guardado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo guardar la receta.",
        variant: "destructive",
      });
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const response = await apiRequest("POST", "/api/recipes/generate", { preferences });
      return response.json();
    },
    onSuccess: (recipe) => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "¡Receta generada!",
        description: "Tu receta personalizada está lista.",
      });
      return recipe;
    },
    onError: (error) => {
      toast({
        title: "Error al generar receta",
        description: "No se pudo generar la receta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/recipes/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Receta eliminada",
        description: "La receta se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la receta.",
        variant: "destructive",
      });
    },
  });

  const generateRecipe = async (preferences: RecipePreferences): Promise<Recipe> => {
    const response = await fetch('/api/recipes/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      throw new Error('Failed to generate recipe');
    }

    const recipe = await response.json();

    // Mark ingredients that were provided by the user
    if (recipe.ingredients && Array.isArray(recipe.ingredients) && preferences.ingredientNames) {
      recipe.ingredients = recipe.ingredients.map((ingredient: any) => {
        if (typeof ingredient === 'object' && ingredient.name) {
          const isUserIngredient = preferences.ingredientNames.some((userIngredient: string) => 
            ingredient.name.toLowerCase().includes(userIngredient.toLowerCase()) ||
            userIngredient.toLowerCase().includes(ingredient.name.toLowerCase())
          );
          return {
            ...ingredient,
            userAdded: isUserIngredient,
            available: isUserIngredient
          };
        }
        return ingredient;
      });
    }

    // Refresh the recipes list to include the new recipe
    queryClient.invalidateQueries({ queryKey: ['recipes'] });

    return recipe;
  };

  return {
    recipes,
    isLoading,
    createRecipe: createRecipeMutation.mutate,
    generateRecipe: generateRecipeMutation.mutateAsync,
    deleteRecipe: deleteRecipeMutation.mutate,
    isCreating: createRecipeMutation.isPending,
    isGenerating: generateRecipeMutation.isPending,
    isDeleting: deleteRecipeMutation.isPending,
  };
}