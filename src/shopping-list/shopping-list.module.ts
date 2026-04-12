import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingListItem } from './entities/shopping-list-item.entity';
import { ShoppingListController } from './shopping-list.controller';
import { ShoppingListService } from './shopping-list.service';
import { CalendarEntry } from '../calendar/entities/calendar-entry.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ShoppingListItem, CalendarEntry])],
    controllers: [ShoppingListController],
    providers: [ShoppingListService],
})
export class ShoppingListModule { }