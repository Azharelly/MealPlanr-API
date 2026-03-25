import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CalendarEntry } from './entities/calendar-entry.entity';
import { CreateCalendarEntryDto } from './dto/create-calendar-entry.dto';
import { UpdateCalendarEntryDto } from './dto/update-calendar-entry.dto';
import { CopyCalendarDto } from './dto/copy-calendar.dto';

@Injectable()
export class CalendarService {
    constructor(
        @InjectRepository(CalendarEntry)
        private readonly calendarRepo: Repository<CalendarEntry>,
    ) { }

    // GET /calendar?startDate=2026-03-23&endDate=2026-03-29
    async getWeek(userId: string, startDate: string, endDate: string) {
        const entries = await this.calendarRepo.find({
            where: {
                userId,
                dateKey: Between(startDate, endDate),
            },
            order: { createdAt: 'ASC' },
        });

        // Agrupar por dateKey y slot — misma forma que CalendarData del frontend
        const grouped: Record<string, Record<string, any[]>> = {};

        for (const entry of entries) {
            if (!grouped[entry.dateKey]) grouped[entry.dateKey] = {};
            if (!grouped[entry.dateKey][entry.slot]) grouped[entry.dateKey][entry.slot] = [];

            grouped[entry.dateKey][entry.slot].push(this.formatEntry(entry));
        }

        return grouped;
    }

    // POST /calendar
    async create(userId: string, dto: CreateCalendarEntryDto) {
        const entry = this.calendarRepo.create({
            userId,
            dateKey: dto.dateKey,
            slot: dto.slot as any,
            recipeId: dto.recipeId,
            status: null,
            skippedIngredients: [],
        });

        const saved = await this.calendarRepo.save(entry);
        return this.calendarRepo.findOne({ where: { id: saved.id } });
    }

    // PATCH /calendar/:id
    async update(userId: string, id: string, dto: UpdateCalendarEntryDto) {
        const entry = await this.calendarRepo.findOne({ where: { id, userId } });
        if (!entry) throw new NotFoundException('Calendar entry not found');

        // Toggle: si el status ya era ese, lo ponemos a null (igual que el frontend)
        if (dto.status !== undefined) {
            entry.status = entry.status === dto.status ? null : dto.status;
        }

        if (dto.skippedIngredients !== undefined) {
            entry.skippedIngredients = dto.skippedIngredients;
        }

        return this.calendarRepo.save(entry);
    }

    // DELETE /calendar/:id
    async remove(userId: string, id: string) {
        const entry = await this.calendarRepo.findOne({ where: { id, userId } });
        if (!entry) throw new NotFoundException('Calendar entry not found');

        await this.calendarRepo.remove(entry);
        return { message: 'Entry removed' };
    }

    // POST /calendar/copy
    async copy(userId: string, dto: CopyCalendarDto) {
        const whereCondition: any = { userId, dateKey: dto.sourceDateKey };
        if (dto.slot) whereCondition.slot = dto.slot;

        const sourceEntries = await this.calendarRepo.find({ where: whereCondition });

        if (sourceEntries.length === 0) {
            return { message: 'Nothing to copy', created: 0 };
        }

        const newEntries: CalendarEntry[] = [];

        for (const targetDate of dto.targetDateKeys) {
            const deleteWhere: any = { userId, dateKey: targetDate };
            if (dto.slot) deleteWhere.slot = dto.slot;
            await this.calendarRepo.delete(deleteWhere);

            for (const source of sourceEntries) {
                const newEntry = this.calendarRepo.create({
                    userId,
                    dateKey: targetDate,
                    slot: source.slot,
                    recipeId: source.recipeId,
                    status: null,
                    skippedIngredients: [],
                });
                newEntries.push(newEntry);
            }
        }

        await this.calendarRepo.save(newEntries);
        return { message: 'Copied successfully', created: newEntries.length };
    }

    private formatEntry(entry: CalendarEntry) {
        return {
            id: entry.id,
            recipe: entry.recipe,
            status: entry.status,
            skippedIngredients: entry.skippedIngredients ?? [],
        };
    }
}