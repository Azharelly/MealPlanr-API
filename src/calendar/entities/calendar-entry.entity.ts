import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { User } from '../../users/user.entity';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type MealStatus = 'consumed' | 'skipped' | 'partial' | null;

@Entity('calendar_entries')
export class CalendarEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'date' })
    dateKey: string; // "2026-03-25"

    @Column({ type: 'varchar' })
    slot: MealSlot;

    @Column({ type: 'varchar', nullable: true })
    status: MealStatus;

    @Column({ type: 'simple-array', nullable: true, default: null })
    skippedIngredients: string[];

    @Column()
    recipeId: string;

    @ManyToOne(() => Recipe, { eager: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'recipeId' })
    recipe: Recipe;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}