import { IsIn, IsString } from 'class-validator';

export class CreateCalendarEntryDto {
    @IsString()
    dateKey: string; // "2026-03-25"

    @IsString()
    @IsIn(['breakfast', 'lunch', 'dinner', 'snack'])
    slot: string;

    @IsString()
    recipeId: string;
}