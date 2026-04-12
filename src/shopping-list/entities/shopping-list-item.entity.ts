import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity()
export class ShoppingListItem {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;

    @Column()
    name: string;

    @Column({ type: 'float', default: 0 })
    amount: number;

    @Column({ default: '' })
    unit: string;

    @Column({ default: 'Other' })
    category: string;

    @Column({ default: false })
    checked: boolean;

    @Column({ default: '' })
    recipeName: string;

    @Column('simple-array', { default: '' })
    recipeIds: string[];
}