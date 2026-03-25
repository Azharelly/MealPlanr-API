import {
  Entity, Column, PrimaryGeneratedColumn,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Ingredient } from './ingredient.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  time: string; // "20 min" — string igual que el frontend

  @Column('int', { default: 1 })
  servings: number;

  @Column('float', { default: 0 })
  totalCalories: number;

  @Column('float', { default: 0 })
  totalProtein: number;

  @Column('float', { default: 0 })
  totalFat: number;

  @Column('float', { default: 0 })
  totalCarbs: number;

  @Column('simple-array', { nullable: true })
  steps: string[]; // array de pasos

  @Column({ nullable: true })
  group: string;

  @OneToMany(() => Ingredient, (ingredient) => ingredient.recipe, {
    cascade: true,
    eager: true,
  })
  ingredients: Ingredient[];

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}