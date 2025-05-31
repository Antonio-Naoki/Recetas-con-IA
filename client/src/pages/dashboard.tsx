import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useRecipes } from "@/hooks/use-recipes";
import RecipeDisplay from "@/components/recipe-display";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Plus, X, Sparkles, Leaf, Utensils } from "lucide-react";

export default function Dashboard() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");
  const [preferences, setPreferences] = useState({
    mealType: 'dinner',
    cookingTime: '30 minutes',
    difficulty: 'easy',
    servings: 4,
    dietaryRestrictions: [] as string[],
  });
  const [generatedRecipeId, setGeneratedRecipeId] = useState<number | null>(null);

  const { generateRecipe, isGenerating } = useRecipes();

  const addIngredient = () => {
    if (currentIngredient.trim() && !ingredients.includes(currentIngredient.trim())) {
      setIngredients([...ingredients, currentIngredient.trim()]);
      setCurrentIngredient("");
    }
  };

  const removeIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter(i => i !== ingredient));
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

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) return;
    
    try {
      const recipe = await generateRecipe({
        ...preferences,
        ingredientNames: ingredients
      });
      setGeneratedRecipeId(recipe.id);
    } catch (error) {
      console.error("Failed to generate recipe:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-eco-primary rounded-lg flex items-center justify-center">
                <Leaf className="text-white" size={16} />
              </div>
              <h1 className="text-xl font-bold text-eco-primary">EcoRecetas IA</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Utensils className="text-eco-primary" size={20} />
              <span className="text-slate-600 font-medium">Generador de Recetas</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Recipe Generator */}
        <Card className="overflow-hidden">
          <div className="relative h-48 overflow-hidden">
            <img 
              src="https://imgs.search.brave.com/uNpA15Xv4kFAf0ZQTN5l_ocyjwLHM7zf2SGU5x2Uk5Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/Zm90by1ncmF0aXMv/dmlzdGEtc3VwZXJp/b3ItbWVzYS1sbGVu/YS1jb21pZGFfMjMt/MjE0OTIwOTIyNS5q/cGc_c2VtdD1haXNf/aHlicmlkJnc9NzQw" 
              alt="Mesa con comida"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-eco-primary/90 to-emerald-700/90"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center text-white">
                <h2 className="text-3xl font-bold mb-2 drop-shadow-md">Generador de Recetas con IA</h2>
                <p className="text-emerald-100 drop-shadow-sm">Crea recetas personalizadas con ingredientes que tienes disponibles</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Ingredients Input */}
            <div className="mb-8">
              <Label className="text-lg font-semibold text-slate-900 mb-4 block">Ingredientes Disponibles</Label>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Escribe un ingrediente (ej: tomate, cebolla, pollo)"
                  value={currentIngredient}
                  onChange={(e) => setCurrentIngredient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                  className="flex-1"
                />
                <Button onClick={addIngredient} disabled={!currentIngredient.trim()}>
                  <Plus size={16} className="mr-2" />
                  Añadir
                </Button>
              </div>

              {/* Selected Ingredients */}
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <Badge 
                      key={index} 
                      className="bg-eco-primary/10 text-eco-primary flex items-center gap-2 px-3 py-1"
                    >
                      {ingredient}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 hover:bg-transparent text-eco-primary/60 hover:text-eco-primary"
                        onClick={() => removeIngredient(ingredient)}
                      >
                        <X size={12} />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Recipe Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Tipo de Comida</Label>
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
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Porciones</Label>
                <Select 
                  value={preferences.servings.toString()} 
                  onValueChange={(value) => setPreferences(prev => ({ ...prev, servings: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 persona</SelectItem>
                    <SelectItem value="2">2 personas</SelectItem>
                    <SelectItem value="3">3 personas</SelectItem>
                    <SelectItem value="4">4 personas</SelectItem>
                    <SelectItem value="5">5 personas</SelectItem>
                    <SelectItem value="6">6 personas</SelectItem>
                    <SelectItem value="8">8 personas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Tiempo de Cocción</Label>
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
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Dificultad</Label>
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
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Restricciones</Label>
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
                <Label className="text-sm font-medium text-slate-700 mb-2 block">Restricciones Seleccionadas</Label>
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

            {/* Generate Button */}
            <Button 
              onClick={handleGenerateRecipe}
              disabled={ingredients.length === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-eco-primary to-emerald-700 hover:from-eco-primary/90 hover:to-emerald-700/90 text-white py-4 text-lg font-semibold"
              size="lg"
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

        {/* Generated Recipe Display */}
        {generatedRecipeId && (
          <div className="mt-8">
            <RecipeDisplay recipeId={generatedRecipeId} />
          </div>
        )}
      </main>
    </div>
  );
}
