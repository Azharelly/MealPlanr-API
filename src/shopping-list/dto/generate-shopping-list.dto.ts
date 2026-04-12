import { IsArray, IsString } from 'class-validator';

export class GenerateShoppingListDto {
    @IsArray()
    @IsString({ each: true })
    dateKeys: string[];
}