import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateCalendarEntryDto {
    @IsOptional()
    @IsIn(['consumed', 'skipped', 'partial', null])
    status?: 'consumed' | 'skipped' | 'partial' | null;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    skippedIngredients?: string[];
}