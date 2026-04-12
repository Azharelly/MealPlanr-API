import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ShoppingListItem } from './entities/shopping-list-item.entity';
import { CalendarEntry } from '../calendar/entities/calendar-entry.entity';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';

const USDA_API_KEY = process.env.USDA_API_KEY;

const CATEGORY_MAP: Record<string, string> = {
    'Poultry Products': 'Meat & Fish',
    'Finfish and Shellfish Products': 'Meat & Fish',
    'Beef Products': 'Meat & Fish',
    'Pork Products': 'Meat & Fish',
    'Lamb, Veal, and Game Products': 'Meat & Fish',
    'Sausages and Luncheon Meats': 'Meat & Fish',
    'Dairy and Egg Products': 'Dairy & Eggs',
    'Vegetables and Vegetable Products': 'Vegetables',
    'Legumes and Legume Products': 'Vegetables',
    'Fruits and Fruit Juices': 'Fruits',
    'Cereal Grains and Pasta': 'Grains & Bread',
    'Baked Products': 'Grains & Bread',
    'Breakfast Cereals': 'Grains & Bread',
    'Nut and Seed Products': 'Nuts & Seeds',
    'Fats and Oils': 'Oils & Condiments',
    'Soups, Sauces, and Gravies': 'Oils & Condiments',
    'Spices and Herbs': 'Oils & Condiments',
    'Sweets': 'Sweets',
    'Beverages': 'Beverages',
};

async function getCategoryFromUSDA(name: string): Promise<string> {
    try {
        const res = await fetch(
            `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(name)}&pageSize=1&api_key=${USDA_API_KEY}`,
        );
        const data = await res.json();
        if (data.foods?.length > 0) {
            const foodCategory = data.foods[0].foodCategory || '';
            return CATEGORY_MAP[foodCategory] || 'Other';
        }
        return 'Other';
    } catch {
        return 'Other';
    }
}

@Injectable()
export class ShoppingListService {
    constructor(
        @InjectRepository(ShoppingListItem)
        private itemRepo: Repository<ShoppingListItem>,
        @InjectRepository(CalendarEntry)
        private calendarRepo: Repository<CalendarEntry>,
    ) { }

    getAll(userId: string) {
        return this.itemRepo.find({ where: { userId }, order: { category: 'ASC' } });
    }

    async generate(userId: string, dto: GenerateShoppingListDto) {
        // 1. Traer entradas del calendar para los días pedidos
        const entries = await this.calendarRepo.find({
            where: { userId, dateKey: In(dto.dateKeys) },
        });

        // 2. Agrupar ingredientes: clave = "nombre|unidad" (case-insensitive)
        type GroupedIngredient = {
            name: string;
            amount: number;
            unit: string;
            recipeName: string;
            recipeIds: string[];
        };

        const grouped = new Map<string, GroupedIngredient>();

        for (const entry of entries) {
            const recipe = entry.recipe;
            if (!recipe?.ingredients) continue;

            for (const ing of recipe.ingredients) {
                const key = `${ing.name.toLowerCase().trim()}|${ing.unit.toLowerCase().trim()}`;
                if (grouped.has(key)) {
                    const existing = grouped.get(key)!;
                    existing.amount += Number(ing.amount) || 0;
                    if (!existing.recipeIds.includes(recipe.id)) {
                        existing.recipeIds.push(recipe.id);
                        existing.recipeName += `, ${recipe.name}`;
                    }
                } else {
                    grouped.set(key, {
                        name: ing.name.trim(),
                        amount: Number(ing.amount) || 0,
                        unit: ing.unit?.trim() || '',
                        recipeName: recipe.name,
                        recipeIds: [recipe.id],
                    });
                }
            }
        }

        // 3. Categorizar con USDA 
        const ingredientList = Array.from(grouped.values());
        const categories: string[] = [];


        for (let i = 0; i < ingredientList.length; i += 5) {
            const chunk = ingredientList.slice(i, i + 5);
            const results = await Promise.all(
                chunk.map(ing => getCategoryFromUSDA(ing.name)),
            );
            categories.push(...results);
        }


        await this.itemRepo.delete({ userId });

        const newItems = ingredientList.map((ing, i) =>
            this.itemRepo.create({
                userId,
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit,
                category: categories[i],
                checked: false,
                recipeName: ing.recipeName,
                recipeIds: ing.recipeIds,
            }),
        );

        return this.itemRepo.save(newItems);
    }

    async toggleChecked(userId: string, itemId: string, checked: boolean) {
        await this.itemRepo.update({ id: itemId, userId }, { checked });
        return this.itemRepo.findOne({ where: { id: itemId, userId } });
    }

    async clearChecked(userId: string) {
        await this.itemRepo.delete({ userId, checked: true });
        return this.getAll(userId);
    }

    async clearAll(userId: string) {
        await this.itemRepo.delete({ userId });
        return [];
    }
}