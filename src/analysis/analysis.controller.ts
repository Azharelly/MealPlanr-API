import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AnalysisService } from './analysis.service';

@Controller('analysis')
@UseGuards(AuthGuard('jwt'))
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get()
  getAnalysis(@Req() req, @Query('weeks') weeks?: string) {
    return this.analysisService.getAnalysis(req.user.id, weeks ? parseInt(weeks) : 4);
  }
}