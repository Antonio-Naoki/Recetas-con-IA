import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useRecipes } from "@/hooks/use-recipes";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { 
  Clock, 
  Users, 
  ChefHat, 
  Check, 
  Star,
  Share2,
  Bookmark,
  Shuffle,
  Download,
  Heart,
  Activity,
  Zap,
  Target,
  Lightbulb,
  Utensils,
  Leaf,
  Award,
  TrendingUp,
  Scale
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ShoppingCart } from "lucide-react";

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
                    {typeof ingredient === 'object' && ingredient.available !== undefined && (
                      <Check className="text-eco-fresh" size={16} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced Recipe Information */}
            <Tabs defaultValue="instructions" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="instructions">📝 Instrucciones</TabsTrigger>
                <TabsTrigger value="nutrition">🥗 Nutrición</TabsTrigger>
                <TabsTrigger value="tips">💡 Consejos</TabsTrigger>
                <TabsTrigger value="sustainability">🌱 Sostenible</TabsTrigger>
              </TabsList>

              <TabsContent value="instructions" className="mt-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <ChefHat className="mr-2 text-eco-primary" size={24} />
                    Instrucciones Paso a Paso
                  </h3>
                  <div className="space-y-4">
                    {recipe.instructions?.map((instruction: any, index: number) => (
                      <div key={index} className="relative">
                        <div className="flex gap-4 p-4 bg-slate-50 rounded-lg border-l-4 border-eco-primary">
                          <div className="flex-shrink-0 w-10 h-10 bg-eco-primary text-white rounded-full flex items-center justify-center font-bold text-lg">
                            {instruction.step || index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-700 leading-relaxed font-medium">{instruction.instruction || instruction}</p>
                            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                              {instruction.time && (
                                <div className="flex items-center">
                                  <Clock size={14} className="mr-1 text-eco-primary" />
                                  {instruction.time} min
                                </div>
                              )}
                              {instruction.temperature && (
                                <div className="flex items-center">
                                  <Zap size={14} className="mr-1 text-orange-500" />
                                  {instruction.temperature}
                                </div>
                              )}
                              {instruction.technique && (
                                <div className="flex items-center">
                                  <Award size={14} className="mr-1 text-purple-500" />
                                  {instruction.technique}
                                </div>
                              )}
                            </div>
                            {instruction.tips && (
                              <div className="mt-2 p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                                <p className="text-sm text-blue-700">💡 <strong>Consejo:</strong> {instruction.tips}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="nutrition" className="mt-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Activity className="mr-2 text-green-500" size={24} />
                    Información Nutricional
                  </h3>

                  {recipe.nutritionalInfo ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Macronutrients */}
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <Target className="mr-2 text-blue-500" size={18} />
                          Macronutrientes por Porción
                        </h4>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Calorías</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.calories}</span>
                            </div>
                            <Progress value={75} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Proteína</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.protein}g</span>
                            </div>
                            <Progress value={60} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Carbohidratos</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.carbs}g</span>
                            </div>
                            <Progress value={80} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Grasa</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.fat}g</span>
                            </div>
                            <Progress value={45} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Fibra</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.fiber}g</span>
                            </div>
                            <Progress value={65} className="h-2" />
                          </div>
                        </div>
                      </Card>

                      {/* Vitamins and Benefits */}
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <Heart className="mr-2 text-red-500" size={18} />
                          Beneficios para la Salud
                        </h4>
                        {recipe.nutritionalInfo.vitamins && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-slate-600 mb-2">Vitaminas principales:</p>
                            <div className="flex flex-wrap gap-1">
                              {recipe.nutritionalInfo.vitamins.map((vitamin: string, index: number) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {vitamin}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {recipe.healthBenefits && (
                          <div>
                            <p className="text-sm font-medium text-slate-600 mb-2">Beneficios:</p>
                            <ul className="text-sm text-slate-600 space-y-1">
                              {recipe.healthBenefits.map((benefit: string, index: number) => (
                                <li key={index} className="flex items-start">
                                  <Check className="mr-2 text-green-500 flex-shrink-0 mt-0.5" size={14} />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Card>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <Activity size={48} className="mx-auto mb-3 opacity-50" />
                      <p>Información nutricional no disponible para esta receta</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="tips" className="mt-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Lightbulb className="mr-2 text-yellow-500" size={24} />
                    Consejos y Sugerencias
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Cooking Tips */}
                    {recipe.cookingTips && (
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <ChefHat className="mr-2 text-eco-primary" size={18} />
                          Consejos de Cocina
                        </h4>
                        <ul className="space-y-2">
                          {recipe.cookingTips.map((tip: string, index: number) => (
                            <li key={index} className="flex items-start text-sm">
                              <Lightbulb className="mr-2 text-yellow-500 flex-shrink-0 mt-0.5" size={14} />
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Serving Suggestions */}
                    {recipe.servingSuggestions && (
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <Utensils className="mr-2 text-purple-500" size={18} />
                          Sugerencias de Servicio
                        </h4>
                        <ul className="space-y-2">
                          {recipe.servingSuggestions.map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start text-sm">
                              <Star className="mr-2 text-purple-500 flex-shrink-0 mt-0.5" size={14} />
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="sustainability" className="mt-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                    <Leaf className="mr-2 text-green-500" size={24} />
                    Impacto Sostenible
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="p-4 text-center">
                      <Scale className="mx-auto mb-2 text-green-500" size={32} />
                      <h4 className="font-semibold text-slate-700 mb-2">Huella de Carbono</h4>
                      <div className="text-2xl font-bold text-green-600 mb-1">Baja</div>
                      <p className="text-xs text-slate-500">Ingredientes locales y técnicas eficientes</p>
                    </Card>

                    <Card className="p-4 text-center">
                      <TrendingUp className="mx-auto mb-2 text-blue-500" size={32} />
                      <h4 className="font-semibold text-slate-700 mb-2">Puntuación Sostenible</h4>
                      <div className="text-2xl font-bold text-blue-600 mb-1">{recipe.sustainabilityScore || 8}/10</div>
                      <p className="text-xs text-slate-500">Basado en ingredientes y métodos</p>
                    </Card>

                    <Card className="p-4 text-center">
                      <Leaf className="mx-auto mb-2 text-emerald-500" size={32} />
                      <h4 className="font-semibold text-slate-700 mb-2">Desperdicio</h4>
                      <div className="text-2xl font-bold text-emerald-600 mb-1">Mínimo</div>
                      <p className="text-xs text-slate-500">Aprovechamiento completo de ingredientes</p>
                    </Card>
                  </div>

                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🌱 Aspectos Sostenibles de esta Receta:</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Ingredientes de temporada y locales cuando sea posible</li>
                      <li>• Técnicas de cocción que minimizan el consumo energético</li>
                      <li>• Aprovechamiento completo de los ingredientes</li>
                      <li>• Reducción del desperdicio alimentario</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </Card>
    </section>
  );
}