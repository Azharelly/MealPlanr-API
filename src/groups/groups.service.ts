import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class GroupsService {
    constructor(
        @InjectRepository(Group)
        private groupsRepo: Repository<Group>,
        @InjectRepository(Recipe)
        private recipesRepo: Repository<Recipe>,
    ) { }

    // Obtener todos los grupos del usuario con sus recetas
    async findAll(userId: string): Promise<Group[]> {
        return this.groupsRepo.find({
            where: { userId },
            relations: ['recipes', 'recipes.ingredients'],
            order: { createdAt: 'ASC' },
        });
    }

    // Crear grupo
    async create(userId: string, dto: CreateGroupDto): Promise<Group> {
        const group = this.groupsRepo.create({
            ...dto,
            userId,
        });
        return this.groupsRepo.save(group);
    }

    // Actualizar nombre o imagen del grupo
    async update(userId: string, id: string, dto: UpdateGroupDto): Promise<Group> {
        const group = await this.groupsRepo.findOne({ where: { id } });
        if (!group) throw new NotFoundException('Group not found');
        if (group.userId !== userId) throw new ForbiddenException();
        Object.assign(group, dto);
        return this.groupsRepo.save(group);
    }

    // Eliminar grupo (las recetas NO se eliminan, solo se desvinculan)
    async remove(userId: string, id: string): Promise<void> {
        const group = await this.groupsRepo.findOne({
            where: { id },
            relations: ['recipes'],
        });
        if (!group) throw new NotFoundException('Group not found');
        if (group.userId !== userId) throw new ForbiddenException();

        // Desvincular recetas del grupo antes de eliminar
        if (group.recipes?.length > 0) {
            await this.recipesRepo
                .createQueryBuilder()
                .update(Recipe)
                .set({ groupId: null })
                .where('groupId = :id', { id })
                .execute();
        }

        await this.groupsRepo.remove(group);
    }

    // Añadir receta a grupo
    async addRecipe(userId: string, groupId: string, recipeId: string): Promise<Group> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Group not found');
        if (group.userId !== userId) throw new ForbiddenException();

        const recipe = await this.recipesRepo.findOne({ where: { id: recipeId, userId } });
        if (!recipe) throw new NotFoundException('Recipe not found');

        recipe.groupId = groupId;
        await this.recipesRepo.save(recipe);

        return this.groupsRepo.findOne({
            where: { id: groupId },
            relations: ['recipes', 'recipes.ingredients'],
        }) as Promise<Group>;
    }

    // Quitar receta de grupo
    async removeRecipe(userId: string, groupId: string, recipeId: string): Promise<Group> {
        const group = await this.groupsRepo.findOne({ where: { id: groupId } });
        if (!group) throw new NotFoundException('Group not found');
        if (group.userId !== userId) throw new ForbiddenException();

        const recipe = await this.recipesRepo.findOne({ where: { id: recipeId, userId } });
        if (!recipe) throw new NotFoundException('Recipe not found');

        recipe.groupId = null;
        await this.recipesRepo.save(recipe);

        return this.groupsRepo.findOne({
            where: { id: groupId },
            relations: ['recipes', 'recipes.ingredients'],

        }) as Promise<Group>;
    }
}