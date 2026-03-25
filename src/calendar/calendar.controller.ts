import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CalendarService } from './calendar.service';
import { CreateCalendarEntryDto } from './dto/create-calendar-entry.dto';
import { UpdateCalendarEntryDto } from './dto/update-calendar-entry.dto';
import { CopyCalendarDto } from './dto/copy-calendar.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    // GET /calendar?startDate=2026-03-23&endDate=2026-03-29
    @Get()
    getWeek(
        @Request() req,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        return this.calendarService.getWeek(req.user.id, startDate, endDate);
    }

    @Post('copy')
    copy(@Request() req, @Body() dto: CopyCalendarDto) {
        return this.calendarService.copy(req.user.id, dto);
    }

    // POST /calendar
    @Post()
    create(@Request() req, @Body() dto: CreateCalendarEntryDto) {
        return this.calendarService.create(req.user.id, dto);
    }

    // PATCH /calendar/:id
    @Patch(':id')
    update(
        @Request() req,
        @Param('id') id: string,
        @Body() dto: UpdateCalendarEntryDto,
    ) {
        return this.calendarService.update(req.user.id, id, dto);
    }

    // DELETE /calendar/:id
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.calendarService.remove(req.user.id, id);
    }
}