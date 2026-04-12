import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, UseGuards, Request,
} from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('groups')
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Get()
    findAll(@Request() req) {
        return this.groupsService.findAll(req.user.id);
    }

    @Post()
    create(@Request() req, @Body() dto: CreateGroupDto) {
        return this.groupsService.create(req.user.id, dto);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() dto: UpdateGroupDto) {
        return this.groupsService.update(req.user.id, id, dto);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.groupsService.remove(req.user.id, id);
    }

    @Post(':id/recipes/:recipeId')
    addRecipe(@Request() req, @Param('id') id: string, @Param('recipeId') recipeId: string) {
        return this.groupsService.addRecipe(req.user.id, id, recipeId);
    }

    @Delete(':id/recipes/:recipeId')
    removeRecipe(@Request() req, @Param('id') id: string, @Param('recipeId') recipeId: string) {
        return this.groupsService.removeRecipe(req.user.id, id, recipeId);
    }
}