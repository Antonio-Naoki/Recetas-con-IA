import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { recognizeIngredientsFromImage, type RecognizedIngredient } from "@/lib/gemini";
import { useToast } from "@/hooks/use-toast";
import type { Ingredient, InsertIngredient } from "@shared/schema";

export function useIngredients() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: ingredients, isLoading } = useQuery<Ingredient[]>({
    queryKey: ["/api/ingredients"],
  });

  const createIngredientMutation = useMutation({
    mutationFn: async (ingredient: InsertIngredient) => {
      const response = await apiRequest("POST", "/api/ingredients", ingredient);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "Ingrediente añadido",
        description: "El ingrediente se ha añadido exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo añadir el ingrediente.",
        variant: "destructive",
      });
    },
  });

  const updateIngredientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertIngredient> }) => {
      const response = await apiRequest("PUT", `/api/ingredients/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "Ingrediente actualizado",
        description: "El ingrediente se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el ingrediente.",
        variant: "destructive",
      });
    },
  });

  const deleteIngredientMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/ingredients/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ingredients"] });
      toast({
        title: "Ingrediente eliminado",
        description: "El ingrediente se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el ingrediente.",
        variant: "destructive",
      });
    },
  });

  const recognizeIngredientsMutation = useMutation({
    mutationFn: async (file: File) => {
      return await recognizeIngredientsFromImage(file);
    },
    onSuccess: (recognizedIngredients: RecognizedIngredient[]) => {
      // Automatically create ingredients from recognition
      recognizedIngredients.forEach(ingredient => {
        const status = ingredient.confidence === 'high' ? 'fresh' : 
                      ingredient.confidence === 'medium' ? 'fresh' : 'expiring';
        
        createIngredientMutation.mutate({
          name: ingredient.name,
          quantity: ingredient.quantity,
          status,
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          imageUrl: null,
        });
      });

      toast({
        title: "¡Ingredientes reconocidos!",
        description: `Se identificaron ${recognizedIngredients.length} ingredientes.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error de reconocimiento",
        description: "No se pudieron reconocer los ingredientes en la imagen.",
        variant: "destructive",
      });
    },
  });

  return {
    ingredients,
    isLoading,
    createIngredient: createIngredientMutation.mutate,
    updateIngredient: updateIngredientMutation.mutate,
    deleteIngredient: deleteIngredientMutation.mutate,
    recognizeIngredients: recognizeIngredientsMutation.mutateAsync,
    isCreating: createIngredientMutation.isPending,
    isUpdating: updateIngredientMutation.isPending,
    isDeleting: deleteIngredientMutation.isPending,
    isRecognizing: recognizeIngredientsMutation.isPending,
  };
}
