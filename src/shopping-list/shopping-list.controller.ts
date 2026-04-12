import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, UseGuards, Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ShoppingListService } from './shopping-list.service';
import { GenerateShoppingListDto } from './dto/generate-shopping-list.dto';
import { UpdateShoppingItemDto } from './dto/update-shopping-item.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('shopping-list')
export class ShoppingListController {
    constructor(private readonly service: ShoppingListService) { }

    @Get()
    getAll(@Request() req) {
        return this.service.getAll(req.user.id);
    }

    @Post('generate')
    generate(@Request() req, @Body() dto: GenerateShoppingListDto) {
        return this.service.generate(req.user.id, dto);
    }

    @Patch(':id')
    toggleChecked(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateShoppingItemDto,
    ) {
        return this.service.toggleChecked(req.user.id, id, dto.checked);
    }

    @Delete('checked')
    clearChecked(@Request() req) {
        return this.service.clearChecked(req.user.id);
    }

    @Delete()
    clearAll(@Request() req) {
        return this.service.clearAll(req.user.id);
    }
}