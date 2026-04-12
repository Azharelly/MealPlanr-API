import {
    Entity, Column, PrimaryGeneratedColumn,
    CreateDateColumn, UpdateDateColumn,
    ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity('groups')
export class Group {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'varchar', nullable: true })
    image: string | null;

    @OneToMany(() => Recipe, (recipe) => recipe.group)
    recipes: Recipe[];

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