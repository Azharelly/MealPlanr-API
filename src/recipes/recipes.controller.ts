import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
@UseGuards(AuthGuard('jwt'))
export class RecipesController {
    constructor(private readonly recipesService: RecipesService) { }

    @Post()
    create(@Body() createRecipeDto: CreateRecipeDto, @Request() req) {
        return this.recipesService.create(createRecipeDto, req.user.id);
    }

    @Get()
    findAll(@Request() req, @Query('group') group?: string) {
        if (group) {
            return this.recipesService.findByGroup(group, req.user.id);
        }
        return this.recipesService.findAll(req.user.id);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        return this.recipesService.findOne(id, req.user.id);
    }

    @Put(':id')
    update(
        @Param('id') id: string,
        @Body() updateRecipeDto: UpdateRecipeDto,
        @Request() req,
    ) {
        return this.recipesService.update(id, updateRecipeDto, req.user.id);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        return this.recipesService.remove(id, req.user.id);
    }
}