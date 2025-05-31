import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ingredients = pgTable("ingredients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  quantity: text("quantity").notNull(),
  status: text("status").notNull(), // 'fresh', 'expiring', 'expired'
  expiryDate: timestamp("expiry_date"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  cookingTime: integer("cooking_time").notNull(), // in minutes
  servings: integer("servings").notNull(),
  difficulty: text("difficulty").notNull(), // 'easy', 'medium', 'hard'
  ingredients: jsonb("ingredients").notNull(), // array of ingredient objects
  instructions: jsonb("instructions").notNull(), // array of instruction objects
  imageUrl: text("image_url"),
  dietaryTags: jsonb("dietary_tags"), // array of strings like 'vegetarian', 'vegan', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const recipePreferences = pgTable("recipe_preferences", {
  id: serial("id").primaryKey(),
  mealType: text("meal_type").notNull(), // 'breakfast', 'lunch', 'dinner', 'snack'
  cookingTime: text("cooking_time").notNull(), // '15 minutes', '30 minutes', etc.
  difficulty: text("difficulty").notNull(),
  dietaryRestrictions: jsonb("dietary_restrictions"), // array of strings
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertIngredientSchema = createInsertSchema(ingredients).omit({
  id: true,
  createdAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertRecipePreferencesSchema = createInsertSchema(recipePreferences).omit({
  id: true,
  createdAt: true,
});

export type InsertIngredient = z.infer<typeof insertIngredientSchema>;
export type Ingredient = typeof ingredients.$inferSelect;

export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;

export type InsertRecipePreferences = z.infer<typeof insertRecipePreferencesSchema>;
export type RecipePreferences = typeof recipePreferences.$inferSelect;
