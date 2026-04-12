import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEntry } from '../calendar/entities/calendar-entry.entity';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEntry])],
  controllers: [AnalysisController],
  providers: [AnalysisService],
})
export class AnalysisModule {}