import { useState } from "react";
import Navigation from "@/components/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useIngredients } from "@/hooks/use-ingredients";
import { useRecipes } from "@/hooks/use-recipes";
import IngredientCard from "@/components/ingredient-card";
import CameraModal from "@/components/camera-modal";
import RecipeGenerator from "@/components/recipe-generator";
import RecipeDisplay from "@/components/recipe-display";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { Plus, Camera, Clock, Users, CheckCircle, Utensils, Lightbulb } from "lucide-react";

export default function Dashboard() {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  const [generatedRecipeId, setGeneratedRecipeId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const { 
    ingredients, 
    isLoading: ingredientsLoading, 
    createIngredient, 
    deleteIngredient,
    recognizeIngredients 
  } = useIngredients();

  const { 
    recipes, 
    generateRecipe, 
    isGenerating 
  } = useRecipes();

  const stats = {
    fresh: ingredients?.filter(i => i.status === 'fresh').length || 0,
    expiring: ingredients?.filter(i => i.status === 'expiring').length || 0,
    expired: ingredients?.filter(i => i.status === 'expired').length || 0,
    total: ingredients?.length || 0,
  };

  const filteredIngredients = ingredients?.filter(ingredient => {
    if (activeFilter === "all") return true;
    if (activeFilter === "fresh") return ingredient.status === "fresh";
    if (activeFilter === "expiring") return ingredient.status === "expiring";
    if (activeFilter === "expired") return ingredient.status === "expired";
    return true;
  }) || [];

  const handleGenerateRecipe = async (ingredientIds: number[], preferences: any) => {
    try {
      const recipe = await generateRecipe(ingredientIds, preferences);
      setGeneratedRecipeId(recipe.id);
    } catch (error) {
      console.error("Failed to generate recipe:", error);
    }
  };

  const handleIngredientToggle = (ingredientId: number) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredientId) 
        ? prev.filter(id => id !== ingredientId)
        : [...prev, ingredientId]
    );
  };

  const suggestedIngredients = ingredients?.filter(i => i.status === 'expiring').slice(0, 3) || [];

  if (ingredientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        {/* Dashboard Overview */}
        <section className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">¡Hola, Usuario!</h2>
            <p className="text-slate-600">
              Tienes <span className="font-semibold text-eco-accent">{stats.expiring} ingredientes</span> que caducan pronto
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Ingredientes Frescos</p>
                  <p className="text-2xl font-bold eco-fresh">{stats.fresh}</p>
                </div>
                <div className="w-12 h-12 bg-eco-fresh/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-eco-fresh" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Próximos a Caducar</p>
                  <p className="text-2xl font-bold eco-expiring">{stats.expiring}</p>
                </div>
                <div className="w-12 h-12 bg-eco-expiring/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-eco-expiring" size={24} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Recetas Generadas</p>
                  <p className="text-2xl font-bold eco-primary">{recipes?.length || 0}</p>
                </div>
                <div className="w-12 h-12 bg-eco-primary/10 rounded-lg flex items-center justify-center">
                  <Utensils className="text-eco-primary" size={24} />
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-eco-primary to-emerald-700 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Añadir Ingredientes</h3>
              <p className="text-emerald-100 mb-4">Usa la cámara o añádelos manualmente</p>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowCameraModal(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  variant="outline"
                >
                  <Camera className="mr-2" size={16} />
                  Cámara
                </Button>
                <Button 
                  onClick={() => {
                    const name = prompt("Nombre del ingrediente:");
                    const quantity = prompt("Cantidad:");
                    if (name && quantity) {
                      createIngredient({
                        name,
                        quantity,
                        status: 'fresh',
                        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        imageUrl: null,
                      });
                    }
                  }}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                  variant="outline"
                >
                  <Plus className="mr-2" size={16} />
                  Manual
                </Button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-eco-accent to-orange-600 rounded-xl p-6 text-white">
              <h3 className="text-xl font-semibold mb-2">Generar Receta</h3>
              <p className="text-orange-100 mb-4">Crea recetas con tus ingredientes disponibles</p>
              <Button 
                onClick={() => {
                  const availableIds = ingredients?.map(i => i.id) || [];
                  if (availableIds.length > 0) {
                    handleGenerateRecipe(availableIds, {
                      mealType: 'dinner',
                      cookingTime: '30 minutes',
                      difficulty: 'easy',
                      dietaryRestrictions: []
                    });
                  }
                }}
                className="bg-white/20 hover:bg-white/30 text-white border-white/20"
                variant="outline"
                disabled={!ingredients || ingredients.length === 0}
              >
                <Utensils className="mr-2" size={16} />
                Generar Ahora
              </Button>
            </div>
          </div>
        </section>

        {/* Ingredients Section */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Mis Ingredientes</h2>
            <div className="flex space-x-3">
              <Button 
                onClick={() => setShowCameraModal(true)}
                className="bg-eco-primary hover:bg-eco-primary/90"
              >
                <Camera className="mr-2" size={16} />
                <span className="hidden sm:inline">Escanear</span>
              </Button>
              <Button 
                onClick={() => {
                  const name = prompt("Nombre del ingrediente:");
                  const quantity = prompt("Cantidad:");
                  if (name && quantity) {
                    createIngredient({
                      name,
                      quantity,
                      status: 'fresh',
                      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                      imageUrl: null,
                    });
                  }
                }}
                variant="outline"
              >
                <Plus className="mr-2" size={16} />
                <span className="hidden sm:inline">Añadir</span>
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-slate-100 rounded-lg p-1 mb-6 overflow-x-auto">
            {[
              { key: "all", label: "Todos" },
              { key: "fresh", label: "Frescos" },
              { key: "expiring", label: "Por Caducar" },
              { key: "expired", label: "Caducados" }
            ].map(filter => (
              <Button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                variant={activeFilter === filter.key ? "default" : "ghost"}
                className={`text-sm whitespace-nowrap ${
                  activeFilter === filter.key 
                    ? "bg-white text-eco-primary shadow-sm" 
                    : "text-slate-600 hover:text-eco-primary"
                }`}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Ingredients Grid */}
          {filteredIngredients.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
              {filteredIngredients.map(ingredient => (
                <IngredientCard
                  key={ingredient.id}
                  ingredient={ingredient}
                  isSelected={selectedIngredients.includes(ingredient.id)}
                  onToggle={() => handleIngredientToggle(ingredient.id)}
                  onDelete={() => deleteIngredient(ingredient.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500">No hay ingredientes en esta categoría</p>
            </div>
          )}

          {/* Suggestion Panel */}
          {suggestedIngredients.length > 0 && (
            <Card className="bg-amber-50 border-amber-200 p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="text-amber-600" size={16} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 mb-1">Sugerencia Inteligente</h4>
                  <p className="text-sm text-amber-800">
                    Tienes ingredientes perfectos para hacer una receta. ¿Quieres que genere una sugerencia?
                  </p>
                  <Button 
                    onClick={() => {
                      const ids = suggestedIngredients.map(i => i.id);
                      handleGenerateRecipe(ids, {
                        mealType: 'dinner',
                        cookingTime: '30 minutes',
                        difficulty: 'easy',
                        dietaryRestrictions: []
                      });
                    }}
                    className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                    size="sm"
                  >
                    Generar Receta
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </section>

        {/* Recipe Generator */}
        <RecipeGenerator
          ingredients={ingredients || []}
          selectedIngredients={selectedIngredients}
          onSelectionChange={setSelectedIngredients}
          onGenerate={handleGenerateRecipe}
          isGenerating={isGenerating}
        />

        {/* Generated Recipe Display */}
        {generatedRecipeId && (
          <RecipeDisplay recipeId={generatedRecipeId} />
        )}
      </main>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onRecognize={recognizeIngredients}
      />

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30">
        <div className="grid grid-cols-4 h-16">
          <button className="flex flex-col items-center justify-center text-eco-primary">
            <Users className="text-lg" />
            <span className="text-xs mt-1">Inicio</span>
          </button>
          <button className="flex flex-col items-center justify-center text-slate-400">
            <div className="text-lg">🥕</div>
            <span className="text-xs mt-1">Ingredientes</span>
          </button>
          <button className="flex flex-col items-center justify-center text-slate-400">
            <Utensils className="text-lg" />
            <span className="text-xs mt-1">Recetas</span>
          </button>
          <button className="flex flex-col items-center justify-center text-slate-400">
            <div className="text-lg">📅</div>
            <span className="text-xs mt-1">Planificar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
