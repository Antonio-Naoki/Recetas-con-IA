import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Sparkles } from "lucide-react";
import { type Ingredient } from "@shared/schema";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface RecipeGeneratorProps {
  ingredients: Ingredient[];
  selectedIngredients: number[];
  onSelectionChange: (ids: number[]) => void;
  onGenerate: (ingredientIds: number[], preferences: any) => void;
  isGenerating: boolean;
}

export default function RecipeGenerator({
  ingredients,
  selectedIngredients,
  onSelectionChange,
  onGenerate,
  isGenerating
}: RecipeGeneratorProps) {
  const [preferences, setPreferences] = useState({
    mealType: 'dinner',
    cookingTime: '30 minutes',
    difficulty: 'easy',
    dietaryRestrictions: [] as string[],
  });

  const addIngredient = (ingredientId: number) => {
    if (!selectedIngredients.includes(ingredientId)) {
      onSelectionChange([...selectedIngredients, ingredientId]);
    }
  };

  const removeIngredient = (ingredientId: number) => {
    onSelectionChange(selectedIngredients.filter(id => id !== ingredientId));
  };

  const addDietaryRestriction = (restriction: string) => {
    if (!preferences.dietaryRestrictions.includes(restriction)) {
      setPreferences(prev => ({
        ...prev,
        dietaryRestrictions: [...prev.dietaryRestrictions, restriction]
      }));
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setPreferences(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.filter(r => r !== restriction)
    }));
  };

  const selectedIngredientObjects = ingredients.filter(ing => 
    selectedIngredients.includes(ing.id)
  );

  const availableIngredients = ingredients.filter(ing => 
    !selectedIngredients.includes(ing.id)
  );

  return (
    <section id="recipe-generation" className="mb-12">
      <Card className="overflow-hidden">
        <div className="bg-eco-primary p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Generador de Recetas IA</h2>
          <p className="text-emerald-100">Crea recetas personalizadas con tus ingredientes disponibles</p>
        </div>

        <div className="p-6">
          {/* Recipe Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Comida</label>
              <Select 
                value={preferences.mealType} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, mealType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Desayuno</SelectItem>
                  <SelectItem value="lunch">Almuerzo</SelectItem>
                  <SelectItem value="dinner">Cena</SelectItem>
                  <SelectItem value="snack">Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tiempo de Cocción</label>
              <Select 
                value={preferences.cookingTime} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingTime: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15 minutes">15 minutos</SelectItem>
                  <SelectItem value="30 minutes">30 minutos</SelectItem>
                  <SelectItem value="45 minutes">45 minutos</SelectItem>
                  <SelectItem value="60+ minutes">60+ minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Dificultad</label>
              <Select 
                value={preferences.difficulty} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, difficulty: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Intermedio</SelectItem>
                  <SelectItem value="hard">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Restricciones</label>
              <Select onValueChange={addDietaryRestriction}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetariano</SelectItem>
                  <SelectItem value="vegan">Vegano</SelectItem>
                  <SelectItem value="gluten-free">Sin gluten</SelectItem>
                  <SelectItem value="dairy-free">Sin lácteos</SelectItem>
                  <SelectItem value="low-carb">Bajo en carbohidratos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dietary Restrictions Tags */}
          {preferences.dietaryRestrictions.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Restricciones Seleccionadas</label>
              <div className="flex flex-wrap gap-2">
                {preferences.dietaryRestrictions.map(restriction => (
                  <Badge key={restriction} variant="secondary" className="flex items-center gap-1">
                    {restriction}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeDietaryRestriction(restriction)}
                    >
                      <X size={12} />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Selected Ingredients */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Ingredientes Seleccionados</label>
            <div className="flex flex-wrap gap-2">
              {selectedIngredientObjects.map(ingredient => (
                <Badge 
                  key={ingredient.id} 
                  className="bg-eco-primary/10 text-eco-primary flex items-center gap-2"
                >
                  {ingredient.name}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-4 w-4 p-0 hover:bg-transparent text-eco-primary/60 hover:text-eco-primary"
                    onClick={() => removeIngredient(ingredient.id)}
                  >
                    <X size={12} />
                  </Button>
                </Badge>
              ))}
              
              {availableIngredients.length > 0 && (
                <Select onValueChange={(value) => addIngredient(parseInt(value))}>
                  <SelectTrigger className="w-auto bg-slate-100 hover:bg-slate-200 text-slate-600 border-dashed">
                    <Plus size={14} className="mr-1" />
                    Añadir más
                  </SelectTrigger>
                  <SelectContent>
                    {availableIngredients.map(ingredient => (
                      <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                        {ingredient.name} ({ingredient.quantity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={() => onGenerate(selectedIngredients, preferences)}
            disabled={selectedIngredients.length === 0 || isGenerating}
            className="w-full bg-gradient-to-r from-eco-primary to-emerald-700 hover:from-eco-primary/90 hover:to-emerald-700/90 text-white py-4 text-lg font-semibold"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Generando Receta...
              </>
            ) : (
              <>
                <Sparkles className="mr-2" size={20} />
                Generar Receta con IA
              </>
            )}
          </Button>
        </div>
      </Card>
    </section>
  );
}
