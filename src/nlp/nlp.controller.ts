import {
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { NlpService } from './nlp.service';

@Controller('nlp')
@UseGuards(AuthGuard('jwt'))
export class NlpController {
    constructor(private readonly nlpService: NlpService) { }

    @Post('extract-file')
    @UseInterceptors(FileInterceptor('file'))
    async extractFromFile(@UploadedFile() file: Express.Multer.File) {
        return this.nlpService.extractFromFile(file);
    }

    @Post('extract-url')
    async extractFromUrl(@Body('url') url: string) {
        return this.nlpService.extractFromUrl(url);
    }
}