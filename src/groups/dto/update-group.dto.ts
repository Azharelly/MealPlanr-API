import { IsString, IsOptional } from 'class-validator';

export class UpdateGroupDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    image?: string | null;
}