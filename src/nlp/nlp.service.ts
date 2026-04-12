import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import FormData from 'form-data';
import axios from 'axios';

@Injectable()
export class NlpService {
    private readonly nlpServiceUrl = 'http://localhost:8000';

    async extractFromFile(file: Express.Multer.File): Promise<any> {
        try {
            const formData = new FormData();
            formData.append('file', file.buffer, {
                filename: file.originalname,
                contentType: file.mimetype,
            });

            const response = await axios.post(
                `${this.nlpServiceUrl}/extract`,
                formData,
                { headers: formData.getHeaders() },
            );

            return response.data;
        } catch (error) {
            throw new HttpException(
                'Failed to extract recipe from file',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async extractFromUrl(url: string): Promise<any> {
        try {
            const response = await axios.post(`${this.nlpServiceUrl}/extract-url`, {
                url,
            });
            return response.data;
        } catch (error) {
            throw new HttpException(
                'Failed to extract recipe from URL',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}