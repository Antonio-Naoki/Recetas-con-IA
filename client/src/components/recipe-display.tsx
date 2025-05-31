import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useRecipes } from "@/hooks/use-recipes";
import { Clock, Users, Star, Heart, Calendar, Share2, RefreshCw, Check, ShoppingCart } from "lucide-react";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";

interface RecipeDisplayProps {
  recipeId: number;
}

export default function RecipeDisplay({ recipeId }: RecipeDisplayProps) {
  const { recipes, isLoading } = useRecipes();
  const { toast } = useToast();
  
  const recipe = recipes?.find(r => r.id === recipeId);

  const shareRecipe = (platform: string) => {
    if (!recipe) return;

    const recipeText = `🍳 ${recipe.title}\n\n${recipe.description}\n\n⏱️ Tiempo: ${recipe.cookingTime} min\n👥 Porciones: ${recipe.servings}\n\nGenerado con EcoRecetas IA`;
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
            title: "Copiado al portapapeles",
            description: "Pega el texto en tu historia de Instagram",
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
              src="https://imgs.search.brave.com/PimXSQve_O-CnrVt2PwaVUc17vD38BrEEDmmUcGhO1Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTMz/NzQ2Nzc1NC9lcy9m/b3RvL2ZvdG8tZGUt/dmlzdGEtc3VwZXJp/b3ItZW4tcHJpbWVy/YS1wZXJzb25hLWRl/LWxhcy1tYW5vcy1k/ZS1sYS1tdWplci1z/b3N0ZW5pZW5kby1s/YS1sb25jaGVyYS1j/b24uanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPTAxZUFDZXBQ/UFhjc0FTNEJRTk8x/ZDZiUkZrczEzUDQ4/MDZfZExHZnpKckk9" 
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-3xl font-bold mb-2">{recipe.title}</h2>
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
                    <span className="text-sm font-medium">
                      {typeof ingredient === 'string' ? ingredient : ingredient.name || ingredient.amount || 'Ingrediente'}
                    </span>
                    {typeof ingredient === 'object' && ingredient.available !== undefined ? (
                      ingredient.available ? (
                        <Check className="text-eco-fresh" size={16} />
                      ) : (
                        <ShoppingCart className="text-slate-400" size={16} />
                      )
                    ) : (
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
                <Button className="bg-eco-primary hover:bg-eco-primary/90">
                  <Calendar className="mr-2" size={16} />
                  Añadir al Planificador
                </Button>
                
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

                <Button variant="outline">
                  <RefreshCw className="mr-2" size={16} />
                  Generar Variación
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
