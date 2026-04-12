import {
    Injectable,
    NotFoundException,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Injectable()
export class RecipesService {
    constructor(
        @InjectRepository(Recipe)
        private recipesRepository: Repository<Recipe>,
    ) { }

    async create(createRecipeDto: CreateRecipeDto, userId: string): Promise<Recipe> {
        const { id, ingredients, groupId, ...rest } = createRecipeDto as any;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const cleanGroupId = groupId && uuidRegex.test(groupId) ? groupId : undefined;

        const cleanIngredients = (ingredients ?? []).map(({ id: ingId, ...ing }: any) => ing);

        const recipe = this.recipesRepository.create({
            ...(rest as Partial<Recipe>),
            ingredients: cleanIngredients,
            userId,
            ...(cleanGroupId ? { groupId: cleanGroupId } : {}),
        });
        return this.recipesRepository.save(recipe);
    }

    async findAll(userId: string): Promise<Recipe[]> {
        return this.recipesRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string, userId: string): Promise<Recipe> {
        const recipe = await this.recipesRepository.findOne({
            where: { id },
        });

        if (!recipe) throw new NotFoundException('Recipe not found');
        if (recipe.userId !== userId) throw new ForbiddenException('Access denied');

        return recipe;
    }

    async findByGroup(groupId: string, userId: string): Promise<Recipe[]> {
        return this.recipesRepository.find({
            where: { groupId, userId },
            order: { createdAt: 'DESC' },
        });
    }

    async update(
        id: string,
        updateRecipeDto: UpdateRecipeDto,
        userId: string,
    ): Promise<Recipe> {
        const recipe = await this.findOne(id, userId);
        Object.assign(recipe, updateRecipeDto);
        return this.recipesRepository.save(recipe);
    }

    async remove(id: string, userId: string): Promise<{ message: string }> {
        const recipe = await this.findOne(id, userId);
        await this.recipesRepository.remove(recipe);
        return { message: 'Recipe deleted successfully' };
    }
}