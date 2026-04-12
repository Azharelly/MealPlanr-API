import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CalendarEntry } from '../calendar/entities/calendar-entry.entity';

@Injectable()
export class AnalysisService {
    constructor(
        @InjectRepository(CalendarEntry)
        private calendarRepo: Repository<CalendarEntry>,
    ) { }

    async getAnalysis(userId: string, weeks: number = 4) {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setDate(now.getDate() - weeks * 7);

        const entries = await this.calendarRepo.find({
            where: {
                userId,
                dateKey: Between(
                    startDate.toISOString().split('T')[0],
                    now.toISOString().split('T')[0],
                ),
            },
        });

        return {
            streak: this.calcStreak(entries),
            weeklyAdherence: this.calcWeeklyAdherence(entries),
            patterns: this.calcPatterns(entries),
            weekComparison: this.calcWeekComparison(entries),
        };
    }



    private calcStreak(entries: CalendarEntry[]) {
        // Group by date → adherence %
        const byDate = this.groupByDate(entries);
        const sortedDates = Object.keys(byDate).sort().reverse(); // newest first

        let current = 0;
        let best = 0;
        let temp = 0;

        for (const date of sortedDates) {
            const adh = this.adherenceForDay(byDate[date]);
            if (adh >= 0.8) {
                temp++;
                if (current === 0) current = temp;
            } else {
                if (current === 0) current = 0;
                best = Math.max(best, temp);
                temp = 0;
            }
        }
        best = Math.max(best, temp, current);

        return { current, best };
    }



    private calcWeeklyAdherence(entries: CalendarEntry[]) {
        const days: { day: string; date: string; value: number }[] = [];
        const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateKey = d.toISOString().split('T')[0];
            const dayEntries = entries.filter(e => e.dateKey === dateKey);
            const value = dayEntries.length > 0
                ? Math.round(this.adherenceForDay(dayEntries) * 100)
                : 0;
            days.push({ day: DAY_LABELS[d.getDay()], date: dateKey, value });
        }

        const avg = days.length > 0
            ? Math.round(days.reduce((s, d) => s + d.value, 0) / days.length)
            : 0;

        return { days, average: avg };
    }



    private calcPatterns(entries: CalendarEntry[]) {
        // Most skipped slot
        const slotSkips: Record<string, number> = {};
        // Hardest day of week
        const daySkips: Record<string, number> = {};
        const dayTotals: Record<string, number> = {};
        // Most skipped ingredient
        const ingredientSkips: Record<string, number> = {};
        // Best day of week
        const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        for (const e of entries) {
            const dow = DAY_NAMES[new Date(e.dateKey).getDay()];
            dayTotals[dow] = (dayTotals[dow] || 0) + 1;

            if (e.status === 'skipped') {
                slotSkips[e.slot] = (slotSkips[e.slot] || 0) + 1;
                daySkips[dow] = (daySkips[dow] || 0) + 1;
            }

            if (e.skippedIngredients?.length) {
                for (const ing of e.skippedIngredients) {
                    ingredientSkips[ing] = (ingredientSkips[ing] || 0) + 1;
                }
            }
        }

        // Adherence per day-of-week
        const dayAdherence: Record<string, number> = {};
        for (const day of Object.keys(dayTotals)) {
            const skipped = daySkips[day] || 0;
            dayAdherence[day] = (dayTotals[day] - skipped) / dayTotals[day];
        }

        const mostSkippedSlot = this.topKey(slotSkips) ?? 'N/A';
        const hardestDay = this.bottomKey(dayAdherence) ?? 'N/A';
        const bestDay = this.topKey(dayAdherence) ?? 'N/A';
        const mostSkippedIngredient = this.topKey(ingredientSkips) ?? 'N/A';

        return { mostSkippedSlot, hardestDay, bestDay, mostSkippedIngredient };
    }

    private calcWeekComparison(entries: CalendarEntry[]) {
        const weeks: { label: string; value: number }[] = [];
        const labels = ['This week', 'Last week', '2 weeks ago'];

        for (let w = 0; w < 3; w++) {
            const start = new Date();
            start.setDate(start.getDate() - (w + 1) * 7);
            const end = new Date();
            end.setDate(end.getDate() - w * 7);

            const startKey = start.toISOString().split('T')[0];
            const endKey = end.toISOString().split('T')[0];

            const weekEntries = entries.filter(
                e => e.dateKey >= startKey && e.dateKey <= endKey,
            );

            const byDate = this.groupByDate(weekEntries);
            const days = Object.values(byDate);
            const avg = days.length > 0
                ? Math.round(
                    days.reduce((s, d) => s + this.adherenceForDay(d) * 100, 0) / days.length,
                )
                : 0;

            weeks.push({ label: labels[w], value: avg });
        }

        const improvement =
            weeks[0].value > 0 && weeks[1].value > 0
                ? Math.round(weeks[0].value - weeks[1].value)
                : null;

        return { weeks, improvement };
    }



    private groupByDate(entries: CalendarEntry[]): Record<string, CalendarEntry[]> {
        return entries.reduce((acc, e) => {
            acc[e.dateKey] = acc[e.dateKey] || [];
            acc[e.dateKey].push(e);
            return acc;
        }, {} as Record<string, CalendarEntry[]>);
    }

    private adherenceForDay(entries: CalendarEntry[]): number {
        if (!entries.length) return 0;
        const consumed = entries.filter(
            e => e.status === 'consumed' || e.status === 'partial',
        ).length;
        return consumed / entries.length;
    }

    private topKey(map: Record<string, number>): string | null {
        const keys = Object.keys(map);
        if (!keys.length) return null;
        return keys.reduce((a, b) => (map[a] > map[b] ? a : b));
    }

    private bottomKey(map: Record<string, number>): string | null {
        const keys = Object.keys(map);
        if (!keys.length) return null;
        return keys.reduce((a, b) => (map[a] < map[b] ? a : b));
    }
}