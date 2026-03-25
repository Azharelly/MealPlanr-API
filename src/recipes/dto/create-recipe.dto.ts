export class CreateIngredientDto {
  name: string;
  amount: string; // string
  unit: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export class CreateRecipeDto {
  name: string;
  image?: string;
  time?: string; // string
  servings?: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  steps?: string[];
  group?: string;
  ingredients: CreateIngredientDto[];
}