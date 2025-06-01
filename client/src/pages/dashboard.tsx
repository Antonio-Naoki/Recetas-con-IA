
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useRecipes } from "@/hooks/use-recipes";
import RecipeDisplay from "@/components/recipe-display";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, X, Sparkles, Leaf, Utensils, Brain, Heart, 
  Clock, Users, ChefHat, Target, Calendar, TrendingUp,
  Zap, Globe, Scale, Activity
} from "lucide-react";

interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface CulinaryPreferences {
  cuisineTypes: string[];
  spiceLevel: number;
  cookingMethods: string[];
  avoidIngredients: string[];
  favoriteIngredients: string[];
}

export default function Dashboard() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentIngredient, setCurrentIngredient] = useState("");

  // Advanced preferences state
  const [preferences, setPreferences] = useState({
    mealType: 'dinner',
    cookingTime: '30 minutes',
    difficulty: 'easy',
    servings: 4,
    dietaryRestrictions: [] as string[],
    budget: 'medium',
    healthFocus: 'balanced'
  });

  const [nutritionalGoals, setNutritionalGoals] = useState<NutritionalGoals>({
    calories: 500,
    protein: 25,
    carbs: 50,
    fat: 20,
    fiber: 10
  });

  const [culinaryPreferences, setCulinaryPreferences] = useState<CulinaryPreferences>({
    cuisineTypes: [],
    spiceLevel: 3,
    cookingMethods: [],
    avoidIngredients: [],
    favoriteIngredients: []
  });

  const [aiPersonality, setAiPersonality] = useState('creative');
  const [sustainabilityMode, setSustainabilityMode] = useState(false);
  const [nutritionOptimization, setNutritionOptimization] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState(false);
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [generatedRecipeId, setGeneratedRecipeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const { generateRecipe, isGenerating } = useRecipes();
  const { toast } = useToast();

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

  const addCuisineType = (cuisine: string) => {
    if (!culinaryPreferences.cuisineTypes.includes(cuisine)) {
      setCulinaryPreferences(prev => ({
        ...prev,
        cuisineTypes: [...prev.cuisineTypes, cuisine]
      }));
    }
  };

  const removeCuisineType = (cuisine: string) => {
    setCulinaryPreferences(prev => ({
      ...prev,
      cuisineTypes: prev.cuisineTypes.filter(c => c !== cuisine)
    }));
  };

  const addCookingMethod = (method: string) => {
    if (!culinaryPreferences.cookingMethods.includes(method)) {
      setCulinaryPreferences(prev => ({
        ...prev,
        cookingMethods: [...prev.cookingMethods, method]
      }));
    }
  };

  const removeCookingMethod = (method: string) => {
    setCulinaryPreferences(prev => ({
      ...prev,
      cookingMethods: prev.cookingMethods.filter(m => m !== method)
    }));
  };

  const handleGenerateRecipe = async () => {
    if (ingredients.length === 0) {
      toast({
        title: "Ingredientes requeridos",
        description: "Por favor añade al menos un ingrediente para generar una receta.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Construct advanced recipe preferences
      let enhancedInstructions = specialInstructions;

      // Add AI personality context
      const personalityContext = {
        creative: "Sé extremadamente creativo y propón combinaciones innovadoras de sabores.",
        health: "Enfócate en maximizar el valor nutricional y usar técnicas de cocción saludables.",
        traditional: "Usa técnicas culinarias tradicionales y recetas clásicas como inspiración.",
        fusion: "Experimenta mezclando diferentes tradiciones culinarias para crear algo único.",
        quick: "Optimiza para velocidad y simplicidad sin sacrificar el sabor."
      };

      enhancedInstructions += ` PERSONALIDAD DE IA: ${personalityContext[aiPersonality as keyof typeof personalityContext]}`;

      // Add nutritional optimization
      if (nutritionOptimization) {
        enhancedInstructions += ` OPTIMIZACIÓN NUTRICIONAL: Crea una receta que tenga aproximadamente ${nutritionalGoals.calories} calorías, ${nutritionalGoals.protein}g de proteína, ${nutritionalGoals.carbs}g de carbohidratos, ${nutritionalGoals.fat}g de grasa, y ${nutritionalGoals.fiber}g de fibra por porción.`;
      }

      // Add sustainability context
      if (sustainabilityMode) {
        enhancedInstructions += " SOSTENIBILIDAD: Prioriza ingredientes locales, de temporada, y técnicas de cocción que minimicen el desperdicio de alimentos y el consumo energético.";
      }

      // Add cuisine preferences
      if (culinaryPreferences.cuisineTypes.length > 0) {
        enhancedInstructions += ` ESTILO CULINARIO: Inspírate en las cocinas: ${culinaryPreferences.cuisineTypes.join(', ')}.`;
      }

      // Add cooking methods
      if (culinaryPreferences.cookingMethods.length > 0) {
        enhancedInstructions += ` MÉTODOS DE COCCIÓN PREFERIDOS: ${culinaryPreferences.cookingMethods.join(', ')}.`;
      }

      // Add spice level
      const spiceLevels = ['muy suave', 'suave', 'medio', 'picante', 'muy picante'];
      enhancedInstructions += ` NIVEL DE PICANTE: ${spiceLevels[culinaryPreferences.spiceLevel - 1]}.`;

      // Add health focus
      const healthFocusMap = {
        weight_loss: "Optimiza para pérdida de peso con ingredientes bajos en calorías y altos en fibra.",
        muscle_gain: "Enfócate en alto contenido proteico para desarrollo muscular.",
        heart_health: "Prioriza ingredientes buenos para la salud cardiovascular.",
        energy_boost: "Incluye ingredientes que proporcionen energía sostenida.",
        balanced: "Mantén un equilibrio nutricional completo."
      };
      enhancedInstructions += ` ENFOQUE DE SALUD: ${healthFocusMap[preferences.healthFocus as keyof typeof healthFocusMap]}`;

      const recipePreferences = {
        ingredientNames: ingredients,
        mealType: preferences.mealType,
        cookingTime: preferences.cookingTime,
        difficulty: preferences.difficulty,
        servings: preferences.servings,
        dietaryRestrictions: preferences.dietaryRestrictions,
        specialInstructions: enhancedInstructions,
        nutritionalGoals: nutritionOptimization ? nutritionalGoals : undefined,
        sustainabilityMode,
        aiPersonality,
        culinaryPreferences,
        budget: preferences.budget,
        weeklyPlan
      };

      const recipe = await generateRecipe(recipePreferences);
      if (recipe && recipe.id) {
        setGeneratedRecipeId(recipe.id);
        setTimeout(() => {
          const element = document.getElementById('generated-recipe');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        throw new Error('No se pudo generar la receta');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      toast({
        title: "Error al generar receta",
        description: "Hubo un problema al generar la receta. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <Card className="overflow-hidden mb-8">
          <div className="relative h-64 overflow-hidden">
            <img 
              src="https://imgs.search.brave.com/uNpA15Xv4kFAf0ZQTN5l_ocyjwLHM7zf2SGU5x2Uk5Q/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/Zm90by1ncmF0aXMv/dmlzdGEtc3VwZXJp/b3ItbWVzYS1sbGVu/YS1jb21pZGFfMjMt/MjE0OTIwOTIyNS5q/cGc_c2VtdD1haXNf/aHlicmlkJnc9NzQw" 
              alt="Mesa con comida"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-eco-primary/95 to-emerald-700/95"></div>
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center text-white">
                <div className="flex items-center justify-center mb-4">
                  <Brain className="mr-3 text-green-800" size={40} />
                  <h1 className="text-4xl font-bold text-green-800 drop-shadow-lg">Super IA Culinaria</h1>
                </div>
                <p className="text-xl text-green-800 font-medium drop-shadow-md mb-4">
                  La aplicación de recetas más inteligente del mundo
                </p>
                <div className="flex justify-center space-x-6 text-sm font-semibold">
                  <div className="flex items-center text-green-800 drop-shadow-md">
                    <Target className="mr-1" size={16} />
                    Nutrición Optimizada
                  </div>
                  <div className="flex items-center text-green-800 drop-shadow-md">
                    <Globe className="mr-1" size={16} />
                    Sostenible
                  </div>
                  <div className="flex items-center text-green-800 drop-shadow-md">
                    <Zap className="mr-1" size={16} />
                    IA Avanzada
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Advanced Recipe Generator */}
        <Card className="overflow-hidden">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic" className="flex items-center">
                  <Utensils className="mr-1" size={16} />
                  Básico
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex items-center">
                  <Heart className="mr-1" size={16} />
                  Nutrición
                </TabsTrigger>
                <TabsTrigger value="culinary" className="flex items-center">
                  <ChefHat className="mr-1" size={16} />
                  Culinario
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center">
                  <Brain className="mr-1" size={16} />
                  IA Avanzada
                </TabsTrigger>
                <TabsTrigger value="sustainability" className="flex items-center">
                  <Leaf className="mr-1" size={16} />
                  Sostenible
                </TabsTrigger>
              </TabsList>

              {/* Basic Tab */}
              <TabsContent value="basic" className="mt-6">
                <div className="space-y-6">
                  {/* Ingredients Input */}
                  <div>
                    <Label className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                      <Utensils className="mr-2" size={20} />
                      Ingredientes Disponibles
                    </Label>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={currentIngredient}
                        onChange={(e) => setCurrentIngredient(e.target.value)}
                        placeholder="Añade un ingrediente..."
                        onKeyPress={(e) => e.key === 'Enter' && addIngredient()}
                        className="flex-1"
                      />
                      <Button onClick={addIngredient} variant="outline">
                        <Plus size={16} />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ingredients.map(ingredient => (
                        <Badge 
                          key={ingredient} 
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
                  </div>

                  {/* Basic Preferences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2">Tipo de Comida</Label>
                      <Select 
                        value={preferences.mealType} 
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, mealType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">🌅 Desayuno</SelectItem>
                          <SelectItem value="lunch">🌞 Almuerzo</SelectItem>
                          <SelectItem value="dinner">🌙 Cena</SelectItem>
                          <SelectItem value="snack">🍪 Snack</SelectItem>
                          <SelectItem value="dessert">🍰 Postre</SelectItem>
                          <SelectItem value="appetizer">🥗 Aperitivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2">Tiempo de Cocción</Label>
                      <Select 
                        value={preferences.cookingTime} 
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, cookingTime: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10 minutes">⚡ 10 minutos</SelectItem>
                          <SelectItem value="15 minutes">🕐 15 minutos</SelectItem>
                          <SelectItem value="30 minutes">🕕 30 minutos</SelectItem>
                          <SelectItem value="45 minutes">🕘 45 minutos</SelectItem>
                          <SelectItem value="60+ minutes">🕛 60+ minutos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2">Dificultad</Label>
                      <Select 
                        value={preferences.difficulty} 
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, difficulty: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">🟢 Fácil</SelectItem>
                          <SelectItem value="medium">🟡 Intermedio</SelectItem>
                          <SelectItem value="hard">🔴 Avanzado</SelectItem>
                          <SelectItem value="expert">🟣 Experto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2">Porciones</Label>
                      <Select 
                        value={preferences.servings.toString()} 
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, servings: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">👤 1 persona</SelectItem>
                          <SelectItem value="2">👥 2 personas</SelectItem>
                          <SelectItem value="4">👨‍👩‍👧‍👦 4 personas</SelectItem>
                          <SelectItem value="6">👥👥 6 personas</SelectItem>
                          <SelectItem value="8">🎉 8+ personas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Health Focus & Budget */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2">Enfoque de Salud</Label>
                      <Select 
                        value={preferences.healthFocus} 
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, healthFocus: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanced">⚖️ Equilibrado</SelectItem>
                          <SelectItem value="weight_loss">📉 Pérdida de peso</SelectItem>
                          <SelectItem value="muscle_gain">💪 Ganancia muscular</SelectItem>
                          <SelectItem value="heart_health">❤️ Salud cardíaca</SelectItem>
                          <SelectItem value="energy_boost">⚡ Más energía</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-slate-700 mb-2">Presupuesto</Label>
                      <Select 
                        value={preferences.budget} 
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, budget: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">💰 Económico</SelectItem>
                          <SelectItem value="medium">💵 Medio</SelectItem>
                          <SelectItem value="high">💎 Premium</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Dietary Restrictions */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2">Restricciones Dietéticas</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
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
                    <Select onValueChange={addDietaryRestriction}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Añadir restricción..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">🥬 Vegetariano</SelectItem>
                        <SelectItem value="vegan">🌱 Vegano</SelectItem>
                        <SelectItem value="gluten-free">🚫🌾 Sin gluten</SelectItem>
                        <SelectItem value="dairy-free">🚫🥛 Sin lácteos</SelectItem>
                        <SelectItem value="low-carb">🥩 Bajo en carbohidratos</SelectItem>
                        <SelectItem value="keto">🥑 Keto</SelectItem>
                        <SelectItem value="paleo">🦕 Paleo</SelectItem>
                        <SelectItem value="low-sodium">🧂 Bajo en sodio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-semibold text-slate-700 flex items-center">
                      <Activity className="mr-2" size={20} />
                      Optimización Nutricional
                    </Label>
                    <Switch
                      checked={nutritionOptimization}
                      onCheckedChange={setNutritionOptimization}
                    />
                  </div>

                  {nutritionOptimization && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Calorías por porción: {nutritionalGoals.calories}
                        </Label>
                        <Slider
                          value={[nutritionalGoals.calories]}
                          onValueChange={(value) => setNutritionalGoals(prev => ({ ...prev, calories: value[0] }))}
                          max={1000}
                          min={200}
                          step={50}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Proteína (g): {nutritionalGoals.protein}
                        </Label>
                        <Slider
                          value={[nutritionalGoals.protein]}
                          onValueChange={(value) => setNutritionalGoals(prev => ({ ...prev, protein: value[0] }))}
                          max={60}
                          min={5}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Carbohidratos (g): {nutritionalGoals.carbs}
                        </Label>
                        <Slider
                          value={[nutritionalGoals.carbs]}
                          onValueChange={(value) => setNutritionalGoals(prev => ({ ...prev, carbs: value[0] }))}
                          max={100}
                          min={10}
                          step={5}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Grasa (g): {nutritionalGoals.fat}
                        </Label>
                        <Slider
                          value={[nutritionalGoals.fat]}
                          onValueChange={(value) => setNutritionalGoals(prev => ({ ...prev, fat: value[0] }))}
                          max={40}
                          min={5}
                          step={2}
                          className="w-full"
                        />
                      </div>

                      <div>
                        <Label className="text-sm font-medium text-slate-700 mb-2">
                          Fibra (g): {nutritionalGoals.fiber}
                        </Label>
                        <Slider
                          value={[nutritionalGoals.fiber]}
                          onValueChange={(value) => setNutritionalGoals(prev => ({ ...prev, fiber: value[0] }))}
                          max={25}
                          min={2}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Culinary Tab */}
              <TabsContent value="culinary" className="mt-6">
                <div className="space-y-6">
                  {/* Cuisine Types */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2">Tipos de Cocina</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {culinaryPreferences.cuisineTypes.map(cuisine => (
                        <Badge key={cuisine} variant="secondary" className="flex items-center gap-1">
                          {cuisine}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeCuisineType(cuisine)}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addCuisineType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Añadir cocina..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="italiana">🇮🇹 Italiana</SelectItem>
                        <SelectItem value="mexicana">🇲🇽 Mexicana</SelectItem>
                        <SelectItem value="asiática">🥢 Asiática</SelectItem>
                        <SelectItem value="mediterránea">🫒 Mediterránea</SelectItem>
                        <SelectItem value="francesa">🇫🇷 Francesa</SelectItem>
                        <SelectItem value="japonesa">🇯🇵 Japonesa</SelectItem>
                        <SelectItem value="india">🇮🇳 India</SelectItem>
                        <SelectItem value="árabe">🌍 Árabe</SelectItem>
                        <SelectItem value="latinoamericana">🌎 Latinoamericana</SelectItem>
                        <SelectItem value="fusión">🔀 Fusión</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Spice Level */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2">
                      Nivel de Picante: {['Muy Suave', 'Suave', 'Medio', 'Picante', 'Muy Picante'][culinaryPreferences.spiceLevel - 1]}
                    </Label>
                    <Slider
                      value={[culinaryPreferences.spiceLevel]}
                      onValueChange={(value) => setCulinaryPreferences(prev => ({ ...prev, spiceLevel: value[0] }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  {/* Cooking Methods */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2">Métodos de Cocción Preferidos</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {culinaryPreferences.cookingMethods.map(method => (
                        <Badge key={method} variant="secondary" className="flex items-center gap-1">
                          {method}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-4 w-4 p-0 hover:bg-transparent"
                            onClick={() => removeCookingMethod(method)}
                          >
                            <X size={12} />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <Select onValueChange={addCookingMethod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Añadir método..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="horneado">🔥 Horneado</SelectItem>
                        <SelectItem value="salteado">🍳 Salteado</SelectItem>
                        <SelectItem value="a la parrilla">🔥 A la parrilla</SelectItem>
                        <SelectItem value="al vapor">💨 Al vapor</SelectItem>
                        <SelectItem value="guisado">🍲 Guisado</SelectItem>
                        <SelectItem value="frito">🍟 Frito</SelectItem>
                        <SelectItem value="crudo">🥗 Crudo</SelectItem>
                        <SelectItem value="asado">🔥 Asado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* AI Tab */}
              <TabsContent value="ai" className="mt-6">
                <div className="space-y-6">
                  {/* AI Personality */}
                  <div>
                    <Label className="text-lg font-semibold text-slate-700 mb-3 flex items-center">
                      <Brain className="mr-2" size={20} />
                      Personalidad de IA Chef
                    </Label>
                    <Select value={aiPersonality} onValueChange={setAiPersonality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="creative">🎨 Creativo - Combinaciones innovadoras</SelectItem>
                        <SelectItem value="health">💚 Saludable - Enfoque nutricional</SelectItem>
                        <SelectItem value="traditional">👨‍🍳 Tradicional - Recetas clásicas</SelectItem>
                        <SelectItem value="fusion">🌐 Fusión - Mezcla culturas</SelectItem>
                        <SelectItem value="quick">⚡ Rápido - Optimizado para velocidad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Weekly Plan */}
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-slate-700 flex items-center">
                        <Calendar className="mr-2" size={16} />
                        Generar Plan Semanal
                      </Label>
                      <p className="text-xs text-slate-500">Crea 7 recetas variadas para toda la semana</p>
                    </div>
                    <Switch
                      checked={weeklyPlan}
                      onCheckedChange={setWeeklyPlan}
                    />
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <Label className="text-sm font-medium text-slate-700 mb-2">Instrucciones Especiales para la IA</Label>
                    <Textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Describe cualquier requerimiento especial: 'quiero algo festivo para una cena romántica', 'necesito que sea fácil de hacer con niños', 'quiero impresionar a mis invitados', etc."
                      className="h-24"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Sustainability Tab */}
              <TabsContent value="sustainability" className="mt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-lg font-semibold text-slate-700 flex items-center">
                        <Leaf className="mr-2" size={20} />
                        Modo Sostenibilidad
                      </Label>
                      <p className="text-sm text-slate-500">Prioriza ingredientes locales, de temporada y técnicas eco-amigables</p>
                    </div>
                    <Switch
                      checked={sustainabilityMode}
                      onCheckedChange={setSustainabilityMode}
                    />
                  </div>

                  {sustainabilityMode && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">Características Sostenibles Activadas:</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>🌱 Ingredientes locales y de temporada</li>
                        <li>♻️ Minimización de desperdicio alimentario</li>
                        <li>⚡ Técnicas de cocción eficientes energéticamente</li>
                        <li>🌍 Reducción de huella de carbono</li>
                        <li>📦 Menos packaging y procesamiento</li>
                      </ul>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Generate Button */}
            <div className="mt-8">
              <Button 
                onClick={handleGenerateRecipe}
                disabled={ingredients.length === 0 || isGenerating}
                className="w-full bg-gradient-to-r from-eco-primary via-emerald-600 to-teal-600 hover:from-eco-primary/90 hover:via-emerald-600/90 hover:to-teal-600/90 text-white py-6 text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-3" />
                    <span className="animate-pulse">Creando tu receta perfecta con IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-3" size={24} />
                    {weeklyPlan ? "🗓️ Generar Plan Semanal con IA" : "🎯 Generar Receta Perfecta con IA"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {/* Generated Recipe Display */}
        {generatedRecipeId && (
          <div id="generated-recipe" className="mt-8">
            <RecipeDisplay recipeId={generatedRecipeId} />
          </div>
        )}
      </main>
    </div>
  );
}
