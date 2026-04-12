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
  time?: string;
  servings?: number;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  steps?: string[];
  groupId?: string;
  ingredients: CreateIngredientDto[];
}