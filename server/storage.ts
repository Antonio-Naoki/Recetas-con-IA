import { 
  ingredients, 
  recipes, 
  recipePreferences,
  type Ingredient, 
  type Recipe, 
  type RecipePreferences,
  type InsertIngredient, 
  type InsertRecipe, 
  type InsertRecipePreferences 
} from "@shared/schema";

export interface IStorage {
  // Ingredients
  getIngredients(): Promise<Ingredient[]>;
  getIngredient(id: number): Promise<Ingredient | undefined>;
  createIngredient(ingredient: InsertIngredient): Promise<Ingredient>;
  updateIngredient(id: number, ingredient: Partial<InsertIngredient>): Promise<Ingredient | undefined>;
  deleteIngredient(id: number): Promise<boolean>;
  
  // Recipes
  getRecipes(): Promise<Recipe[]>;
  getRecipe(id: number): Promise<Recipe | undefined>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  deleteRecipe(id: number): Promise<boolean>;
  
  // Recipe Preferences
  getRecipePreferences(): Promise<RecipePreferences[]>;
  createRecipePreferences(preferences: InsertRecipePreferences): Promise<RecipePreferences>;
  updateRecipePreferences(id: number, preferences: Partial<InsertRecipePreferences>): Promise<RecipePreferences | undefined>;
}

export class MemStorage implements IStorage {
  private ingredients: Map<number, Ingredient>;
  private recipes: Map<number, Recipe>;
  private recipePreferences: Map<number, RecipePreferences>;
  private currentIngredientId: number;
  private currentRecipeId: number;
  private currentPreferencesId: number;

  constructor() {
    this.ingredients = new Map();
    this.recipes = new Map();
    this.recipePreferences = new Map();
    this.currentIngredientId = 1;
    this.currentRecipeId = 1;
    this.currentPreferencesId = 1;
  }

  // Ingredients
  async getIngredients(): Promise<Ingredient[]> {
    return Array.from(this.ingredients.values());
  }

  async getIngredient(id: number): Promise<Ingredient | undefined> {
    return this.ingredients.get(id);
  }

  async createIngredient(insertIngredient: InsertIngredient): Promise<Ingredient> {
    const id = this.currentIngredientId++;
    const ingredient: Ingredient = {
      ...insertIngredient,
      id,
      createdAt: new Date(),
    };
    this.ingredients.set(id, ingredient);
    return ingredient;
  }

  async updateIngredient(id: number, updateData: Partial<InsertIngredient>): Promise<Ingredient | undefined> {
    const existing = this.ingredients.get(id);
    if (!existing) return undefined;
    
    const updated: Ingredient = { ...existing, ...updateData };
    this.ingredients.set(id, updated);
    return updated;
  }

  async deleteIngredient(id: number): Promise<boolean> {
    return this.ingredients.delete(id);
  }

  // Recipes
  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async createRecipe(insertRecipe: InsertRecipe): Promise<Recipe> {
    const id = this.currentRecipeId++;
    const recipe: Recipe = {
      ...insertRecipe,
      id,
      createdAt: new Date(),
    };
    this.recipes.set(id, recipe);
    return recipe;
  }

  async deleteRecipe(id: number): Promise<boolean> {
    return this.recipes.delete(id);
  }

  // Recipe Preferences
  async getRecipePreferences(): Promise<RecipePreferences[]> {
    return Array.from(this.recipePreferences.values());
  }

  async createRecipePreferences(insertPreferences: InsertRecipePreferences): Promise<RecipePreferences> {
    const id = this.currentPreferencesId++;
    const preferences: RecipePreferences = {
      ...insertPreferences,
      id,
      createdAt: new Date(),
    };
    this.recipePreferences.set(id, preferences);
    return preferences;
  }

  async updateRecipePreferences(id: number, updateData: Partial<InsertRecipePreferences>): Promise<RecipePreferences | undefined> {
    const existing = this.recipePreferences.get(id);
    if (!existing) return undefined;
    
    const updated: RecipePreferences = { ...existing, ...updateData };
    this.recipePreferences.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
