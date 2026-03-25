import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

export class CopyCalendarDto {
    @IsString()
    sourceDateKey: string; // "2026-03-25"

    @IsArray()
    @IsString({ each: true })
    targetDateKeys: string[]; // ["2026-03-26", "2026-03-27"]

    @IsOptional()
    @IsString()
    @IsIn(['breakfast', 'lunch', 'dinner', 'snack'])
    slot?: string;
}