import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRecipes } from "@/hooks/use-recipes";
import { Clock, Users, Star, Heart, Calendar, Share2, RefreshCw, Check, ShoppingCart } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface RecipeDisplayProps {
  recipeId: number;
}

const foodKeywords = [
  'pizza', 'burger', 'pasta', 'salad', 'steak', 'sushi', 'taco', 'sandwich', 'soup', 'dessert', 
  'cake', 'pie', 'chocolate', 'fruit', 'vegetable', 'chicken', 'fish', 'rice', 'bread', 'egg',
  'pollo', 'carne', 'pescado', 'verdura', 'fruta', 'ensalada', 'sopa', 'postre', 'arroz', 'pan',
  'huevo', 'queso', 'tomate', 'cebolla', 'ajo', 'papas', 'patatas', 'guiso', 'asado', 'frito'
];

const getFoodImageUrl = (recipeTitle: string): string => {
  const title = recipeTitle.toLowerCase();
  const keyword = foodKeywords.find(k => title.includes(k)) || 'delicious-food';
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&q=80&auto=format`;
};

export default function RecipeDisplay({ recipeId }: RecipeDisplayProps) {
  const { recipes, isLoading, generateRecipe } = useRecipes();
  const { toast } = useToast();
  const [isGeneratingVariation, setIsGeneratingVariation] = useState(false);

  const recipe = recipes?.find(r => r.id === recipeId);

  const generateVariation = async () => {
    if (!recipe) return;

    setIsGeneratingVariation(true);

    try {
      // Extract ingredient names from the current recipe
      const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
      const ingredientNames = ingredients.map((ing: any) => 
        typeof ing === 'string' ? ing : ing.name || 'Ingrediente'
      );

      // Create a more specific variation request
      const preferences = {
        ingredientNames,
        mealType: 'dinner',
        cookingTime: '30 minutes',
        difficulty: recipe.difficulty || 'easy',
        servings: recipe.servings || 4,
        dietaryRestrictions: [],
        // Add specific variation instructions
        specialInstructions: `Genera una variación de la receta "${recipe.title}". Usa ingredientes similares pero cambia la técnica de cocción, las especias, o la presentación. Mantén el mismo tipo de plato pero hazlo diferente y creativo.`,
        isVariation: true,
        originalRecipe: {
          title: recipe.title,
          ingredients: ingredientNames,
          cookingMethod: recipe.instructions?.[0] || ''
        }
      };

      const newRecipe = await generateRecipe(preferences);

      toast({
        title: "¡Variación generada!",
        description: `Nueva variación creada: "${newRecipe?.title || 'Nueva receta'}"`,
      });

      // Scroll to top to see the new recipe
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
      console.error('Error generating variation:', error);
      toast({
        title: "Error al generar variación",
        description: "No se pudo generar la variación. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingVariation(false);
    }
  };

  const shareRecipe = (platform: string) => {
    if (!recipe) return;

    const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
    const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];

    // Formatear ingredientes
    const ingredientsText = ingredients.map((ingredient: any, index: number) => {
      if (typeof ingredient === 'string') {
        return `• ${ingredient}`;
      }
      const name = ingredient.name || 'Ingrediente';
      const amount = ingredient.amount || '';
      return `• ${name}: ${amount}`;
    }).join('\n');

    // Formatear instrucciones
    const instructionsText = instructions.map((instruction: any, index: number) => {
      const stepNumber = typeof instruction === 'object' && instruction.step ? instruction.step : index + 1;
      const text = typeof instruction === 'string' ? instruction : instruction.instruction || 'Paso de preparación';
      const time = typeof instruction === 'object' && instruction.time ? ` (${instruction.time} min)` : '';
      return `${stepNumber}. ${text}${time}`;
    }).join('\n\n');

    const recipeText = `🍳 ${recipe.title}

📝 ${recipe.description}

⏱️ Tiempo: ${recipe.cookingTime} min
👥 Porciones: ${recipe.servings} personas
🔥 Dificultad: ${recipe.difficulty}

🛒 INGREDIENTES:
${ingredientsText}

👩‍🍳 INSTRUCCIONES:
${instructionsText}

💡 Generado con EcoRecetas IA`;

    const encodedText = encodeURIComponent(recipeText);
    const currentUrl = window.location.href;

    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedText}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodedText}`;
        break;
      case 'instagram':
        // Instagram no permite enlaces directos, copiamos al portapapeles
        navigator.clipboard.writeText(recipeText).then(() => {
          toast({
            title: "Receta copiada al portapapeles",
            description: "Pega el texto completo en tu historia de Instagram",
          });
        });
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!recipe) {
    return null;
  }

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const dietaryTags = Array.isArray(recipe.dietaryTags) ? recipe.dietaryTags : [];

  return (
    <section id="generated-recipe" className="mb-12">
      <Card className="overflow-hidden">
        <div className="relative">
          {/* Recipe Header Image */}
          <div className="h-64 bg-gradient-to-r from-eco-primary/20 to-eco-accent/20 flex items-center justify-center relative overflow-hidden">
            <img 
              src={getFoodImageUrl(recipe.title)}
              alt={recipe.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Multiple fallback food images
                const target = e.target as HTMLImageElement;
                const fallbacks = [
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=400&fit=crop&q=80', // Cooking ingredients
                  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=400&fit=crop&q=80', // Food preparation
                  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=400&fit=crop&q=80', // Meal spread
                  'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=400&fit=crop&q=80', // Pizza/Italian
                  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop&q=80', // Burger/American
                  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&h=400&fit=crop&q=80'  // Pasta dish
                ];
                const currentSrc = target.src;
                const currentIndex = fallbacks.findIndex(url => currentSrc.includes(url.split('?')[0].split('/').pop() || ''));
                if (currentIndex < fallbacks.length - 1) {
                  target.src = fallbacks[currentIndex + 1];
                } else {
                  // Final fallback - generic food image
                  target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=400&fit=crop&q=80';
                }
              }}
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white drop-shadow-lg">
            <h2 className="text-3xl font-bold mb-2 text-white drop-shadow-md">{recipe.title}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <span className="flex items-center space-x-1">
                <Clock size={16} />
                <span>{recipe.cookingTime} minutos</span>
              </span>
              <span className="flex items-center space-x-1">
                <Users size={16} />
                <span>{recipe.servings} personas</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star size={16} />
                <span className="capitalize">{recipe.difficulty}</span>
              </span>
            </div>
          </div>
          <Button 
            size="sm"
            variant="secondary"
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
          >
            <Heart size={16} />
          </Button>
        </div>

        <div className="p-6">
          {/* Recipe Description */}
          {recipe.description && (
            <p className="text-slate-700 mb-6">{recipe.description}</p>
          )}

          {/* Dietary Tags */}
          {dietaryTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {dietaryTags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-eco-primary/10 text-eco-primary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ingredients List */}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Ingredientes</h3>
              <div className="space-y-3">
                {ingredients.map((ingredient: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      {typeof ingredient === 'string' ? (
                        <span className="text-sm font-medium">{ingredient}</span>
                      ) : (
                        <div>
                          <span className="text-sm font-medium text-slate-900">
                            {ingredient.name || 'Ingrediente'}
                          </span>
                          {ingredient.amount && (
                            <span className="text-sm text-slate-600 ml-2">
                              - {ingredient.amount}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {typeof ingredient === 'object' && ingredient.available !== undefined ? (
                      <Check className="text-eco-fresh" size={16} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div className="lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Instrucciones</h3>
              <div className="space-y-4">
                {instructions.map((instruction: any, index: number) => (
                  <div key={index} className="flex space-x-4">
                    <div className="w-8 h-8 bg-eco-primary text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {typeof instruction === 'object' && instruction.step ? instruction.step : index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-slate-700">
                        {typeof instruction === 'string' ? instruction : instruction.instruction || 'Paso de preparación'}
                      </p>
                      {typeof instruction === 'object' && instruction.time && (
                        <p className="text-sm text-slate-500 mt-1">{instruction.time} minutos</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recipe Actions */}
              <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-slate-200">
                {/* Share Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      <Share2 className="mr-2" size={16} />
                      Compartir
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => shareRecipe('whatsapp')}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">W</span>
                        </div>
                        WhatsApp
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareRecipe('telegram')}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">T</span>
                        </div>
                        Telegram
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => shareRecipe('instagram')}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 mr-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">I</span>
                        </div>
                        Instagram
                      </div>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="outline"
                  onClick={generateVariation}
                  disabled={isGeneratingVariation}
                >
                  <RefreshCw className={`mr-2 ${isGeneratingVariation ? 'animate-spin' : ''}`} size={16} />
                  {isGeneratingVariation ? 'Generando...' : 'Generar Variación'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}