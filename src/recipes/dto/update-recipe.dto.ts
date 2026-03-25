export class UpdateIngredientDto {
  id?: string;
  name?: string;
  amount?: string;
  unit?: string;
  calories?: number;
  protein?: number;
  fat?: number;
  carbs?: number;
}

export class UpdateRecipeDto {
  name?: string;
  image?: string;
  time?: string;
  servings?: number;
  totalCalories?: number;
  totalProtein?: number;
  totalFat?: number;
  totalCarbs?: number;
  steps?: string[];
  group?: string;
  ingredients?: UpdateIngredientDto[];
}