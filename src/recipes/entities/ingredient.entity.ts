import {
    Entity, Column, PrimaryGeneratedColumn,
    ManyToOne, JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';

@Entity('ingredients')
export class Ingredient {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    amount: string; // string igual que el frontend ("100", "0.5")

    @Column()
    unit: string;

    @Column('float', { default: 0 })
    calories: number;

    @Column('float', { default: 0 })
    protein: number;

    @Column('float', { default: 0 })
    fat: number;

    @Column('float', { default: 0 })
    carbs: number;

    @ManyToOne(() => Recipe, (recipe) => recipe.ingredients, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'recipeId' })
    recipe: Recipe;
}