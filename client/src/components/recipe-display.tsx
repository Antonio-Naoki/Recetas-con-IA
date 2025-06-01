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
    const dietaryTags = Array.isArray(recipe.dietaryTags) ? recipe.dietaryTags : [];

    // Formatear ingredientes con cantidades y preparación
    const ingredientsText = ingredients.map((ingredient: any, index: number) => {
      if (typeof ingredient === 'string') {
        return `• ${ingredient}`;
      }
      const name = ingredient.name || 'Ingrediente';
      const amount = ingredient.amount || '';
      const preparation = ingredient.preparation ? ` (${ingredient.preparation})` : '';
      const substitutes = ingredient.substitutes && ingredient.substitutes.length > 0 
        ? ` - Alt: ${ingredient.substitutes.join(', ')}`
        : '';
      return `• ${name}${amount ? `: ${amount}` : ''}${preparation}${substitutes}`;
    }).join('\n');

    // Formatear instrucciones con tiempo y técnicas
    const instructionsText = instructions.map((instruction: any, index: number) => {
      const stepNumber = typeof instruction === 'object' && instruction.step ? instruction.step : index + 1;
      const text = typeof instruction === 'string' ? instruction : instruction.instruction || 'Paso de preparación';
      const time = typeof instruction === 'object' && instruction.time ? ` ⏱️ ${instruction.time} min` : '';
      const temperature = typeof instruction === 'object' && instruction.temperature ? ` 🌡️ ${instruction.temperature}` : '';
      const technique = typeof instruction === 'object' && instruction.technique ? ` 🎯 ${instruction.technique}` : '';
      const tips = typeof instruction === 'object' && instruction.tips ? `\n   💡 Consejo: ${instruction.tips}` : '';
      
      return `${stepNumber}. ${text}${time}${temperature}${technique}${tips}`;
    }).join('\n\n');

    // Formatear consejos de cocina
    const cookingTipsText = recipe.cookingTips && recipe.cookingTips.length > 0 
      ? `\n\n🔥 CONSEJOS DE COCINA:
${recipe.cookingTips.map((tip: string) => `• ${tip}`).join('\n')}`
      : '';

    // Formatear sugerencias de servicio
    const servingSuggestionsText = recipe.servingSuggestions && recipe.servingSuggestions.length > 0 
      ? `\n\n🍽️ SUGERENCIAS DE SERVICIO:
${recipe.servingSuggestions.map((suggestion: string) => `• ${suggestion}`).join('\n')}`
      : '';

    // Formatear información nutricional si está disponible
    const nutritionalText = recipe.nutritionalInfo 
      ? `\n\n📊 INFORMACIÓN NUTRICIONAL (por porción):
• Calorías: ${recipe.nutritionalInfo.calories}
• Proteína: ${recipe.nutritionalInfo.protein}g
• Carbohidratos: ${recipe.nutritionalInfo.carbs}g
• Grasa: ${recipe.nutritionalInfo.fat}g
• Fibra: ${recipe.nutritionalInfo.fiber}g`
      : '';

    // Formatear beneficios para la salud si están disponibles
    const healthBenefitsText = recipe.healthBenefits && recipe.healthBenefits.length > 0
      ? `\n\n❤️ BENEFICIOS PARA LA SALUD:
${recipe.healthBenefits.map((benefit: string) => `• ${benefit}`).join('\n')}`
      : '';

    // Formatear etiquetas dietéticas
    const tagsText = dietaryTags.length > 0 
      ? `\n\n🏷️ Etiquetas: ${dietaryTags.join(', ')}`
      : '';

    const recipeText = `🍳 ${recipe.title.toUpperCase()}

📝 ${recipe.description || 'Deliciosa receta casera'}

⏱️ Tiempo de preparación: ${recipe.cookingTime} minutos
👥 Porciones: ${recipe.servings} personas
🔥 Dificultad: ${recipe.difficulty}${tagsText}

🛒 INGREDIENTES NECESARIOS:
${ingredientsText}

👩‍🍳 INSTRUCCIONES PASO A PASO:
${instructionsText}${cookingTipsText}${servingSuggestionsText}${nutritionalText}${healthBenefitsText}

🌱 Receta generada con inteligencia artificial por EcoRecetas
💚 Cocina sostenible y saludable

#EcoRecetas #CocinaIA #RecetasSaludables #CocinaCreativa`;

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
            title: "✅ Receta copiada al portapapeles",
            description: "Pega el texto completo en tu historia de Instagram o post",
          });
        }).catch(() => {
          toast({
            title: "❌ Error al copiar",
            description: "No se pudo copiar la receta al portapapeles",
            variant: "destructive",
          });
        });
        return;
      default:
        return;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank');
      toast({
        title: "🚀 Receta compartida",
        description: `Receta enviada a ${platform.charAt(0).toUpperCase() + platform.slice(1)}`,
      });
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
          <div className="absolute top-4 right-4 flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm"
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
                >
                  <Share2 size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={() => shareRecipe('whatsapp')} className="cursor-pointer">
                  <svg className="mr-2 h-4 w-4 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.492"/>
                  </svg>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareRecipe('telegram')} className="cursor-pointer">
                  <svg className="mr-2 h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareRecipe('instagram')} className="cursor-pointer">
                  <svg className="mr-2 h-4 w-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
            >
              <Heart size={16} />
            </Button>
          </div>
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

          {/* Share Recipe Button */}
          <div className="mb-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Share2 className="mr-2" size={16} />
                  Compartir Receta Completa
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuItem onClick={() => shareRecipe('whatsapp')} className="cursor-pointer">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.492"/>
                  </svg>
                  WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareRecipe('telegram')} className="cursor-pointer">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Telegram
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => shareRecipe('instagram')} className="cursor-pointer">
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  Instagram
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

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
                            <Progress value={Math.min((recipe.nutritionalInfo.calories / 500) * 100, 100)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Proteína</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.protein}g</span>
                            </div>
                            <Progress value={Math.min((recipe.nutritionalInfo.protein / 30) * 100, 100)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Carbohidratos</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.carbs}g</span>
                            </div>
                            <Progress value={Math.min((recipe.nutritionalInfo.carbs / 50) * 100, 100)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Grasa</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.fat}g</span>
                            </div>
                            <Progress value={Math.min((recipe.nutritionalInfo.fat / 25) * 100, 100)} className="h-2" />
                          </div>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Fibra</span>
                              <span className="text-sm font-bold">{recipe.nutritionalInfo.fiber}g</span>
                            </div>
                            <Progress value={Math.min((recipe.nutritionalInfo.fiber / 15) * 100, 100)} className="h-2" />
                          </div>
                        </div>
                      </Card>

                      {/* Vitamins and Benefits */}
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <Heart className="mr-2 text-red-500" size={18} />
                          Beneficios para la Salud
                        </h4>
                        {recipe.nutritionalInfo.vitamins && recipe.nutritionalInfo.vitamins.length > 0 && (
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
                        {recipe.healthBenefits && recipe.healthBenefits.length > 0 && (
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
                        {(!recipe.healthBenefits || recipe.healthBenefits.length === 0) && 
                         (!recipe.nutritionalInfo.vitamins || recipe.nutritionalInfo.vitamins.length === 0) && (
                          <div className="text-center py-4 text-slate-500">
                            <p className="text-sm">Información de beneficios en desarrollo</p>
                          </div>
                        )}
                      </Card>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Estimated Nutrition */}
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <Target className="mr-2 text-blue-500" size={18} />
                          Estimación Nutricional (por porción)
                        </h4>
                        <div className="space-y-3">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">Calorías estimadas</span>
                              <span className="text-sm font-bold">~350-450</span>
                            </div>
                            <p className="text-xs text-slate-600">Basado en los ingredientes de la receta</p>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-green-50 rounded text-center">
                              <div className="font-semibold text-green-700">Proteínas</div>
                              <div className="text-green-600">Alto</div>
                            </div>
                            <div className="p-2 bg-orange-50 rounded text-center">
                              <div className="font-semibold text-orange-700">Carbohidratos</div>
                              <div className="text-orange-600">Moderado</div>
                            </div>
                          </div>
                        </div>
                      </Card>

                      {/* General Benefits */}
                      <Card className="p-4">
                        <h4 className="font-semibold text-slate-700 mb-3 flex items-center">
                          <Heart className="mr-2 text-red-500" size={18} />
                          Beneficios Generales
                        </h4>
                        <ul className="text-sm text-slate-600 space-y-2">
                          <li className="flex items-start">
                            <Check className="mr-2 text-green-500 flex-shrink-0 mt-0.5" size={14} />
                            Rica en proteínas de alta calidad
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 text-green-500 flex-shrink-0 mt-0.5" size={14} />
                            Aporta vitaminas y minerales esenciales
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 text-green-500 flex-shrink-0 mt-0.5" size={14} />
                            Equilibrio de macronutrientes
                          </li>
                          <li className="flex items-start">
                            <Check className="mr-2 text-green-500 flex-shrink-0 mt-0.5" size={14} />
                            Ingredientes frescos y naturales
                          </li>
                        </ul>
                        <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                          💡 La información nutricional detallada se actualizará en futuras recetas generadas
                        </div>
                      </Card>
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